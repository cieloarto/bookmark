import { Counter } from '../app/features/counter';

const Popup = () => {
  document.body.className = 'w-[30rem] h-[15rem]';

  const checkDuplicatesButton = document.getElementById('checkDuplicates');
  if (checkDuplicatesButton) {
    checkDuplicatesButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'checkDuplicates' });
    });
  }

  const checkBrokenLinksButton = document.getElementById('checkBrokenLinks');
  if (checkBrokenLinksButton) {
    checkBrokenLinksButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'checkBrokenLinks' });
    });
  }

  const categorizeBookmarksButton = document.getElementById('categorizeBookmarks');
  if (categorizeBookmarksButton) {
    categorizeBookmarksButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'categorizeBookmarks' });
    });
  }

  return (
    <>
      <div className="flex justify-center mt-2 text-base">Popup Counter</div>
      <Counter />
    </>
  );
};

export default Popup;
