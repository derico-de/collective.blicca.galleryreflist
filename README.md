# Collective Blicca Galleryreflist

Gallery section block for the Aurora editor: a heading, a text and a Reference List composed into one block, with registrable styles

## Features

- Compatible with Plone 6.0+

## Installation

Add `collective.blicca.galleryreflist` to your project's dependencies:

```python
# In your pyproject.toml
dependencies = [
    "collective.blicca.galleryreflist",
    # ...
]
```

Then activate the addon in your Plone site's control panel or via GenericSetup.

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/collective/collective.blicca.galleryreflist.git
cd collective.blicca.galleryreflist

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install in development mode
pip install -e ".[test]"
```

### Running Tests

```bash
pytest
```

### Running Tests with Coverage

```bash
pytest --cov=collective.blicca.galleryreflist --cov-report=html
```

## License

GPL-2.0-or-later

## Author

Maik Derstappen <md@derico.de>
