const CLASS_NAMES = {
  bookmark: 'bookmark',
  favicon: 'favicon',
  folder: 'folder',
  childContainer: 'childContainer',
};

let folderCount;

window.onload = async function () {
  setBodyHeightFromStorage();

  const bookmarkTreeNodes = await chrome.bookmarks.getTree();
  folderCount = countFolders(bookmarkTreeNodes[0].children);

  createBookmarks(bookmarkTreeNodes);
  setTimeout(saveCurrentHeight, 600);
};

function setBodyHeightFromStorage() {
  let savedHeight = localStorage.getItem('savedHeight');
  if (savedHeight && savedHeight > 30) {
    document.body.style.height = `${savedHeight}px`;
  }
}

function saveCurrentHeight() {
  let currentHeight = document.getElementById('bookmarks').clientHeight;
  localStorage.setItem('savedHeight', currentHeight - 8);
}

function createBookmarks(bookmarkTreeNodes) {
  const bookmarksContainer = document.getElementById('bookmarks');

  if (folderCount === 0) {
    showEmptyBookmarkMessage();
  } else {
    showBookmarks(bookmarkTreeNodes, bookmarksContainer);
  }
}

function showEmptyBookmarkMessage() {
  const bookmarksContainer = document.getElementById('bookmarks');

  const messageElement = createElement(
    'p',
    'message',
    '🍁 No bookmarks in the current browser.',
  );

  bookmarksContainer.appendChild(messageElement);
}

function createElement(type, className, textContent = '') {
  let element = document.createElement(type);
  element.className = className;
  element.textContent = textContent;
  return element;
}

function showBookmarks(bookmarkNodes, parent) {
  if (!bookmarkNodes || !bookmarkNodes.length) {
    return;
  }

  for (let bookmarkNode of bookmarkNodes) {
    if (bookmarkNode.url) {
      createBookmarkItem(bookmarkNode, parent);
    }

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
      createFolderForBookmarks(bookmarkNode, parent);
    }
  }
}

function createBookmarkItem(bookmarkNode, parent) {
  let favicon = createElement('img', CLASS_NAMES.favicon);
  favicon.src = `${chrome.runtime.getURL(
    '/_favicon?',
  )}pageUrl=${encodeURIComponent(bookmarkNode.url)}&size=32`;

  let bookItem = createElement('a', CLASS_NAMES.bookmark);
  bookItem.href = bookmarkNode.url;
  bookItem.target = '_blank';
  bookItem.appendChild(favicon);

  let linkTitle = createElement('p', '', bookmarkNode.title);
  bookItem.appendChild(linkTitle);

  parent.appendChild(bookItem);
}

function createFolderForBookmarks(bookmarkNode, parent) {
  let folder = createElement('div', CLASS_NAMES.folder);

  // Use the pre-computed folderCount instead of calling countFolders
  if (folderCount > 1 && bookmarkNode.title) {
    let folderTitle = createElement('h2', '', bookmarkNode.title);
    folder.appendChild(folderTitle);
  } else {
    folder.style.marginTop = '4px';
  }

  let childContainer = createElement('div', CLASS_NAMES.childContainer);
  showBookmarks(bookmarkNode.children, childContainer);

  folder.appendChild(childContainer);
  parent.appendChild(folder);
}

function countFolders(bookmarkNodes) {
  let count = 0;
  for (let i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].children && bookmarkNodes[i].children.length > 0) {
      count += 1 + countFolders(bookmarkNodes[i].children);
    }
  }
  return count;
}
