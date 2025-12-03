"""
README Generator Agent
A Flask application that generates professional README.md files for GitHub repositories

Optimized for Windows 11 with PowerShell
"""

from flask import Flask, render_template, request, jsonify, send_file
import requests
import anthropic
import os
import sys
from io import BytesIO

# Ensure UTF-8 encoding on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

app = Flask(__name__)

# Note: In production, use environment variables for API keys
# For this demo, the Anthropic client will use the backend authentication
client = anthropic.Anthropic()

def fetch_github_repo_data(owner, repo):
    """Fetch repository data from GitHub API"""
    base_url = "https://api.github.com"
    
    try:
        # Fetch main repository info
        repo_response = requests.get(f"{base_url}/repos/{owner}/{repo}")
        repo_response.raise_for_status()
        repo_data = repo_response.json()
        
        # Fetch repository contents
        contents_response = requests.get(f"{base_url}/repos/{owner}/{repo}/contents")
        contents_response.raise_for_status()
        contents = contents_response.json()
        
        # Fetch languages
        languages_response = requests.get(f"{base_url}/repos/{owner}/{repo}/languages")
        languages_response.raise_for_status()
        languages = languages_response.json()
        
        return {
            'name': repo_data.get('name', ''),
            'description': repo_data.get('description', 'No description provided'),
            'stars': repo_data.get('stargazers_count', 0),
            'forks': repo_data.get('forks_count', 0),
            'language': repo_data.get('language', 'Not specified'),
            'languages': list(languages.keys()),
            'topics': repo_data.get('topics', []),
            'homepage': repo_data.get('homepage', ''),
            'contents': [{'name': item['name'], 'type': item['type']} for item in contents if isinstance(contents, list)],
            'default_branch': repo_data.get('default_branch', 'main'),
            'owner': owner,
            'repo': repo,
            'license': repo_data.get('license', {}).get('name', 'Not specified') if repo_data.get('license') else 'Not specified'
        }
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch repository data: {str(e)}")

def generate_readme_with_claude(repo_data):
    """Generate README content using Claude API"""
    
    prompt = f"""You are a technical writer creating a professional README.md file for a GitHub repository.

Repository Information:
- Name: {repo_data['name']}
- Description: {repo_data['description']}
- Primary Language: {repo_data['language']}
- Languages Used: {', '.join(repo_data['languages'])}
- Topics/Tags: {', '.join(repo_data['topics']) if repo_data['topics'] else 'None'}
- Stars: {repo_data['stars']}
- Forks: {repo_data['forks']}
- Homepage: {repo_data['homepage'] if repo_data['homepage'] else 'None'}
- License: {repo_data['license']}
- Repository Structure: {', '.join([f"{c['name']} ({c['type']})" for c in repo_data['contents'][:20]])}

Create a comprehensive, professional README.md that includes:

1. **Project Title and Description**: Clear, compelling introduction with badges
2. **Features**: Key features based on the available information
3. **Installation**: Step-by-step installation instructions appropriate for the language/framework
4. **Usage**: Basic usage examples (provide generic examples based on the language)
5. **Project Structure**: Overview of the repository contents
6. **Technologies Used**: Based on the languages detected
7. **Contributing**: Standard contribution guidelines
8. **License**: Reference the license information

IMPORTANT FORMATTING RULES:
- Use proper Markdown syntax
- Use ## for main sections (not #)
- Include code blocks with appropriate language tags
- Keep it professional and well-organized
- Make reasonable assumptions about functionality based on the repo name and language
- Include GitHub badges at the top (Stars, Forks, Language, License)
- Use the format: ![Stars](https://img.shields.io/github/stars/{repo_data['owner']}/{repo_data['repo']})

Output ONLY the README.md content with proper Markdown formatting. Do not include any explanations outside the README content."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return message.content[0].text
    except Exception as e:
        raise Exception(f"Failed to generate README with Claude: {str(e)}")

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    """Generate README for a given GitHub repository"""
    try:
        data = request.get_json()
        repo_url = data.get('repo_url', '').strip()
        
        if not repo_url:
            return jsonify({'error': 'Repository URL is required'}), 400
        
        # Extract owner and repo from URL
        # Expected format: https://github.com/owner/repo
        parts = repo_url.rstrip('/').split('/')
        if 'github.com' not in repo_url or len(parts) < 2:
            return jsonify({'error': 'Invalid GitHub URL. Use format: https://github.com/owner/repo'}), 400
        
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')
        
        # Fetch repository data
        repo_data = fetch_github_repo_data(owner, repo)
        
        # Generate README with Claude
        readme_content = generate_readme_with_claude(repo_data)
        
        return jsonify({
            'success': True,
            'readme': readme_content,
            'repo_data': {
                'name': repo_data['name'],
                'language': repo_data['language'],
                'stars': repo_data['stars'],
                'forks': repo_data['forks']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['POST'])
def download():
    """Download the generated README as a file"""
    try:
        data = request.get_json()
        readme_content = data.get('content', '')
        
        if not readme_content:
            return jsonify({'error': 'No content to download'}), 400
        
        # Create a BytesIO object to send as file
        buffer = BytesIO()
        buffer.write(readme_content.encode('utf-8'))
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name='README.md',
            mimetype='text/markdown'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
