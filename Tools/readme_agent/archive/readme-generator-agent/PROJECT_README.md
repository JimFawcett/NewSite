# README Generator Agent

A Python-based web application that automatically generates professional README.md files for any public GitHub repository using AI-powered analysis.

## Features

- 🤖 **AI-Powered Generation**: Uses Claude AI to create comprehensive, well-structured README files
- 🔍 **GitHub Integration**: Automatically fetches repository metadata, languages, and structure
- 👀 **Live Preview**: View the generated README before downloading
- 💾 **One-Click Download**: Download the generated README.md directly to your computer
- 🎨 **Clean Interface**: Simple, modern web interface built with vanilla HTML/CSS/JavaScript
- 📊 **Repository Stats**: Displays stars, forks, languages, and other metadata

## Prerequisites

- Python 3.8 or higher
- Anthropic API access (Claude)
- Internet connection (for GitHub API and Claude API)

## Installation

1. **Clone or download this repository**

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up Anthropic API credentials:**

The application uses the Anthropic client which will authenticate via the backend. In a production environment, you would set the API key as an environment variable:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

For development in claude.ai, the authentication is handled automatically.

## Usage

1. **Start the Flask application:**
```bash
python readme_agent.py
```

The server will start on `http://0.0.0.0:5000`

2. **Open your web browser and navigate to:**
```
http://localhost:5000
```

3. **Generate a README:**
   - Paste a GitHub repository URL (e.g., `https://github.com/facebook/react`)
   - Click "Generate README"
   - Wait for the AI to analyze the repository and create the README
   - Review the preview
   - Click "Download README.md" to save the file

## How It Works

1. **Repository Analysis**: The application fetches repository data from GitHub's public API, including:
   - Repository metadata (name, description, stars, forks)
   - Programming languages used
   - Repository structure and contents
   - Topics and tags
   - License information

2. **AI Generation**: Claude AI analyzes the repository data and generates a professional README with:
   - Project title and description
   - Feature list
   - Installation instructions
   - Usage examples
   - Technology stack
   - Contributing guidelines
   - License information

3. **Preview & Download**: Users can review the generated content and download it as a markdown file.

## Project Structure

```
.
├── readme_agent.py          # Main Flask application
├── requirements.txt         # Python dependencies
├── templates/
│   └── index.html          # Web interface (HTML + CSS + JS)
└── README.md               # This file
```

## API Endpoints

- `GET /` - Serves the main web interface
- `POST /generate` - Generates README for a given repository
  - Request body: `{"repo_url": "https://github.com/owner/repo"}`
  - Response: `{"success": true, "readme": "...", "repo_data": {...}}`
- `POST /download` - Downloads the generated README as a file
  - Request body: `{"content": "markdown content"}`
  - Response: File download

## Technologies Used

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: 
  - GitHub REST API (for repository data)
  - Anthropic Claude API (for AI generation)

## Customization

You can customize the README generation by modifying the prompt in the `generate_readme_with_claude()` function in `readme_agent.py`. Adjust the sections, tone, or formatting to match your preferences.

## Limitations

- Only works with **public** GitHub repositories
- Requires active internet connection
- GitHub API has rate limits (60 requests/hour for unauthenticated requests)
- Generated README is based on available metadata and may need manual refinement

## Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive credentials
- The application does not store any repository data
- All processing happens in real-time

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is provided as-is for educational and practical use.

## Troubleshooting

**Issue**: "Repository not found" error
- **Solution**: Ensure the repository is public and the URL is correct

**Issue**: Rate limit exceeded
- **Solution**: Wait an hour or authenticate with GitHub API (add token support)

**Issue**: Claude API errors
- **Solution**: Check your Anthropic API credentials and quota

## Future Enhancements

- [ ] Support for private repositories (with authentication)
- [ ] Multiple README templates/styles
- [ ] Batch processing for multiple repositories
- [ ] README quality scoring
- [ ] Integration with additional code hosting platforms
- [ ] Custom section selection
- [ ] Markdown rendering preview

## Support

For issues or questions, please open an issue on the project repository or contact the maintainer.

---

**Made with ❤️ using Python, Flask, and Claude AI**
