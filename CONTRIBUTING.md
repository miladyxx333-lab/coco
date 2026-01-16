# Contributing to COCO

First off, thank you for considering contributing to COCO! It's people like you that make COCO such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Python/Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **Include mockups or examples if applicable**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `pip install -r requirements.txt && npm install`
3. **Make your changes** with descriptive commit messages
4. **Add tests** if applicable
5. **Ensure the test suite passes**: `python -m pytest && npm test`
6. **Update documentation** if needed
7. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/coco.git
cd coco

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Edit .env with your API keys

# Run the CLI
python coco_os.py

# Run tests
python -m pytest
npm test
```

## Project Structure

```
coco/
├── coco_os.py           # Main entry point
├── coco_ship.py         # Production file generator
├── coco_vision.py       # Visual regression testing
├── coco_fluidity.py     # Multi-channel sync
├── src/                 # TypeScript modules
├── prompts/             # System prompts
├── essences/            # Token libraries
├── dashboard/           # Web UI
└── tests/               # Test files
```

## Coding Style

### Python

- Follow PEP 8
- Use type hints where possible
- Maximum line length: 100 characters
- Use descriptive variable names

```python
# Good
def generate_tokens(design_prompt: str, use_gemini: bool = False) -> Dict[str, Any]:
    """Generate design tokens from a natural language prompt."""
    pass

# Bad
def gen_tok(p, g=False):
    pass
```

### TypeScript

- Follow the existing ESLint configuration
- Use TypeScript strict mode
- Prefer interfaces over type aliases for object shapes

```typescript
// Good
interface DesignToken {
  name: string;
  value: string;
  type: TokenType;
}

// Bad
type DesignToken = {
  name: any;
  value: any;
}
```

## Commit Messages

Use conventional commits:

```
feat: add visual regression testing
fix: correct token export format
docs: update installation instructions
style: format code with prettier
refactor: simplify state machine logic
test: add unit tests for token generator
chore: update dependencies
```

## Adding New Features

### New Design Essence

1. Create a JSON file in `essences/`
2. Follow the token schema:

```json
{
  "name": "My Essence",
  "version": "1.0.0",
  "description": "Description of the essence",
  "tokens": {
    "colors": {},
    "spacing": {},
    "typography": {},
    "borderRadius": {},
    "shadows": {}
  },
  "psychology": {
    "targetAudience": "description",
    "emotionalTone": "description"
  }
}
```

3. Add tests for the new essence
4. Update the documentation

### New Export Format

1. Add the generator function in `coco_ship.py`
2. Register the format in the `ship_all()` method
3. Add CLI flag support
4. Write tests
5. Update the README

## Testing

```bash
# Run all Python tests
python -m pytest

# Run with coverage
python -m pytest --cov=.

# Run specific test file
python -m pytest tests/test_vision.py

# Run Node.js tests
npm test
```

## Documentation

- Update the README for any user-facing changes
- Add docstrings to new functions and classes
- Update the prompts/ documentation if behavior changes

## Questions?

Feel free to open a Discussion on GitHub or reach out on Twitter.

---

Thank you for contributing! 🎨
