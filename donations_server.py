#!/usr/bin/env python3
"""
COCO Donations Server - Stripe Integration
Simple donation server for COCO open source project

Usage:
    python donations_server.py

Endpoints:
    POST /create-checkout-session  - Create Stripe checkout session
    POST /webhook                  - Handle Stripe webhooks
    GET  /                        - Redirect to landing page
"""

import os
import json
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import stripe

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY')

# Donation tiers
DONATION_TIERS = {
    'supporter': {
        'name': 'Supporter',
        'amount': 500,  # $5.00 in cents
        'description': 'Name in CREDITS.md',
        'mode': 'subscription',
        'interval': 'month'
    },
    'backer': {
        'name': 'Backer',
        'amount': 2000,  # $20.00 in cents
        'description': 'Logo on README + priority support',
        'mode': 'subscription',
        'interval': 'month'
    },
    'sponsor': {
        'name': 'Sponsor',
        'amount': 10000,  # $100.00 in cents
        'description': 'Logo on landing page + feature requests',
        'mode': 'subscription',
        'interval': 'month'
    },
    'one-time-5': {
        'name': 'One-time Support ($5)',
        'amount': 500,
        'description': 'One-time donation to COCO',
        'mode': 'payment'
    },
    'one-time-20': {
        'name': 'One-time Support ($20)',
        'amount': 2000,
        'description': 'One-time donation to COCO',
        'mode': 'payment'
    },
    'one-time-50': {
        'name': 'One-time Support ($50)',
        'amount': 5000,
        'description': 'One-time donation to COCO',
        'mode': 'payment'
    },
    'custom': {
        'name': 'Custom Donation',
        'description': 'Support with any amount',
        'mode': 'payment'
    }
}

# Your domain (update for production)
DOMAIN = os.getenv('DOMAIN', 'http://localhost:5174')
SUCCESS_URL = f"{DOMAIN}/donate-success.html"
CANCEL_URL = f"{DOMAIN}/#donate"


@app.route('/')
def index():
    """Redirect to landing page"""
    return redirect(DOMAIN)


@app.route('/config', methods=['GET'])
def get_config():
    """Return public Stripe key and donation tiers"""
    return jsonify({
        'publicKey': STRIPE_PUBLIC_KEY,
        'tiers': {
            k: {
                'name': v['name'],
                'amount': v['amount'] if 'amount' in v else None,
                'description': v['description'],
                'mode': v['mode']
            }
            for k, v in DONATION_TIERS.items()
        }
    })


@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create a Stripe checkout session"""
    try:
        data = request.get_json()
        tier_id = data.get('tier', 'one-time-20')
        custom_amount = data.get('amount')  # In dollars for custom
        email = data.get('email')
        
        tier = DONATION_TIERS.get(tier_id)
        if not tier:
            return jsonify({'error': 'Invalid tier'}), 400
        
        # Determine amount
        if tier_id == 'custom' and custom_amount:
            amount = int(float(custom_amount) * 100)  # Convert to cents
            if amount < 100:  # Minimum $1
                return jsonify({'error': 'Minimum donation is $1'}), 400
        else:
            amount = tier.get('amount', 2000)
        
        # Build checkout session parameters
        checkout_params = {
            'payment_method_types': ['card'],
            'success_url': SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url': CANCEL_URL,
            'metadata': {
                'tier': tier_id,
                'project': 'coco'
            }
        }
        
        if email:
            checkout_params['customer_email'] = email
        
        # Subscription vs one-time payment
        if tier.get('mode') == 'subscription':
            # Create a price for subscription
            checkout_params['mode'] = 'subscription'
            checkout_params['line_items'] = [{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"COCO {tier['name']}",
                        'description': tier['description'],
                    },
                    'unit_amount': amount,
                    'recurring': {
                        'interval': tier.get('interval', 'month')
                    }
                },
                'quantity': 1,
            }]
        else:
            # One-time payment
            checkout_params['mode'] = 'payment'
            checkout_params['line_items'] = [{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"COCO Donation - {tier['name']}",
                        'description': tier['description'],
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }]
        
        # Create the session
        session = stripe.checkout.Session.create(**checkout_params)
        
        return jsonify({
            'id': session.id,
            'url': session.url
        })
    
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle Stripe webhooks"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            event = json.loads(payload)
        
        # Handle specific events
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            handle_successful_payment(session)
        
        elif event['type'] == 'customer.subscription.created':
            subscription = event['data']['object']
            handle_new_subscription(subscription)
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            handle_canceled_subscription(subscription)
        
        return jsonify({'status': 'success'})
    
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({'error': 'Invalid signature'}), 400


def handle_successful_payment(session):
    """Handle successful one-time payment"""
    print(f"✓ Payment successful!")
    print(f"  Customer: {session.get('customer_email', 'N/A')}")
    print(f"  Amount: ${session.get('amount_total', 0) / 100:.2f}")
    print(f"  Tier: {session.get('metadata', {}).get('tier', 'N/A')}")
    
    # TODO: Add to CREDITS.md, send thank you email, etc.


def handle_new_subscription(subscription):
    """Handle new subscription"""
    print(f"✓ New subscription!")
    print(f"  Customer: {subscription.get('customer')}")
    print(f"  Status: {subscription.get('status')}")
    
    # TODO: Add to sponsors list, update landing page, etc.


def handle_canceled_subscription(subscription):
    """Handle canceled subscription"""
    print(f"✗ Subscription canceled")
    print(f"  Customer: {subscription.get('customer')}")
    
    # TODO: Remove from sponsors list


if __name__ == '__main__':
    print("""
╔═══════════════════════════════════════════════════════════════╗
║  COCO Donations Server                                        ║
║  Stripe Integration for Open Source Support                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Endpoints:                                                   ║
║  POST /create-checkout-session  - Create checkout            ║
║  POST /webhook                  - Stripe webhooks            ║
║  GET  /config                   - Get public config          ║
║                                                               ║
║  Donation Tiers:                                              ║
║  • Supporter ($5/mo)  - Name in CREDITS.md                   ║
║  • Backer ($20/mo)    - Logo on README + priority            ║
║  • Sponsor ($100/mo)  - Logo on landing + features           ║
║  • One-time ($5, $20, $50, custom)                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    if not stripe.api_key:
        print("⚠ Warning: STRIPE_SECRET_KEY not set in .env")
    else:
        print("✓ Stripe configured")
    
    app.run(host='0.0.0.0', port=5002, debug=True)
