import { RepoData, RepoFile } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

// List of file names/extensions that are likely to be important for analysis.
const IMPORTANT_FILES_WHITELIST = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'webpack.config.js',
    '.eslintrc.json',
    'tailwind.config.js',
    'babel.config.js',
    'README.md',
    'Dockerfile',
    'docker-compose.yml',
    'pom.xml',
    'build.gradle',
    'settings.gradle',
    'requirements.txt',
    'Pipfile',
    'pyproject.toml',
    'Gemfile',
    'composer.json',
    'go.mod',
    'Cargo.toml',
    'src/index.tsx',
    'src/index.ts',
    'src/main.ts',
    'src/App.tsx',
];
const MAX_FILES_TO_FETCH = 10;
const MAX_FILE_SIZE_BYTES = 100000; // 100KB

const parseRepoUrl = (url: string): { owner: string; repo: string } => {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(p => p);
        if (parsedUrl.hostname !== 'github.com' || pathParts.length < 2) {
            throw new Error();
        }
        const [owner, repo] = pathParts;
        return { owner, repo: repo.replace(/\.git$/, '') };
    } catch (e) {
        throw new Error('Invalid GitHub repository URL.');
    }
};

const fetchWithAuth = async (url: string, token: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });
    if (!response.ok) {
        if(response.status === 401) {
            throw new Error('GitHub API request failed: Invalid token.');
        }
        if(response.status === 404) {
            throw new Error('GitHub API request failed: Repository not found.');
        }
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}. ${errorData.message}`);
    }
    return response.json();
};

export const getRepositoryContents = async (repoUrl: string, token: string): Promise<RepoData> => {
    const { owner, repo } = parseRepoUrl(repoUrl);

    // 1. Get the main branch's last commit SHA
    const branches = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, token);
    const mainBranch = branches.find((b: any) => b.name === 'main' || b.name === 'master');
    if (!mainBranch) {
        throw new Error('Could not find main or master branch.');
    }
    const latestCommitSha = mainBranch.commit.sha;

    // 2. Get the entire file tree for that commit
    const treeData = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${latestCommitSha}?recursive=1`, token);
    const filesInRepo = treeData.tree.filter((node: any) => node.type === 'blob');

    // 3. Identify important files to fetch content for
    const filesToFetch = filesInRepo
        .filter((file: any) => IMPORTANT_FILES_WHITELIST.includes(file.path) || IMPORTANT_FILES_WHITELIST.some(ext => file.path.endsWith(ext)))
        .filter((file: any) => file.size < MAX_FILE_SIZE_BYTES)
        .slice(0, MAX_FILES_TO_FETCH);

    // 4. Fetch content for those files
    const fileContents: RepoFile[] = await Promise.all(
        filesToFetch.map(async (file: any) => {
            const fileData = await fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs/${file.sha}`, token);
            // Decode base64 content
            const content = atob(fileData.content);
            return { path: file.path, content };
        })
    );
    
    return {
        tree: filesInRepo,
        files: fileContents,
    };
};