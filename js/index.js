document.addEventListener('DOMContentLoaded', () => {
  const githubForm = document.getElementById('github-form');
  const searchInput = document.getElementById('search');
  const userList = document.getElementById('user-list');
  const reposList = document.getElementById('repos-list');

  githubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
      try {
        userList.innerHTML = '<li class="loading">Searching users...</li>';
        const users = await searchUsers(searchTerm);
        displayUsers(users);
      } catch (error) {
        userList.innerHTML = '<li class="loading">Error searching users. Please try again.</li>';
        console.error('Error searching users:', error);
      }
    }
  });

  async function searchUsers(query) {
    const response = await fetch(`https://api.github.com/search/users?q=${query}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  }

  function displayUsers(users) {
    userList.innerHTML = '';
    reposList.innerHTML = '';
    
    if (users.length === 0) {
      userList.innerHTML = '<li class="loading">No users found. Try a different search.</li>';
      return;
    }
    
    users.forEach(user => {
      const userCard = document.createElement('li');
      userCard.className = 'user-card';
      userCard.innerHTML = `
        <img src="${user.avatar_url}" alt="${user.login}">
        <h3>${user.login}</h3>
        <a href="${user.html_url}" target="_blank">View Profile</a>
      `;
      
      userCard.addEventListener('click', async () => {
        try {
          userList.querySelectorAll('.user-card').forEach(card => {
            card.style.opacity = '0.6';
          });
          userCard.style.opacity = '1';
          
          reposList.innerHTML = '<li class="loading">Loading repositories...</li>';
          const repos = await getUserRepos(user.login);
          displayRepos(user.login, repos);
        } catch (error) {
          reposList.innerHTML = '<li class="loading">Error loading repositories.</li>';
          console.error('Error fetching repos:', error);
        }
      });
      
      userList.appendChild(userCard);
    });
  }

  async function getUserRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  }

  function displayRepos(username, repos) {
    reposList.innerHTML = '';
    
    if (repos.length === 0) {
      reposList.innerHTML = '<li class="loading">No public repositories found for this user.</li>';
      return;
    }
    
    repos.forEach(repo => {
      const repoItem = document.createElement('li');
      repoItem.className = 'repo-item';
      repoItem.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
        <p>${repo.description || 'No description available'}</p>
        <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</p>
      `;
      reposList.appendChild(repoItem);
    });
  }
});
