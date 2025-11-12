function checkProhibitedWords(text: string, words: string) {
	// Return early if words is empty or invalid
	if (!words || typeof words !== 'string' || words.trim() === '') {
		return { action: 'pass', text, matchedWords: [] };
	}

	const wordList = words.split(',').map(word => word.trim()).filter(word => word.length > 0);
	
	// Return early if no valid words
	if (wordList.length === 0) {
		return { action: 'pass', text, matchedWords: [] };
	}

	// Escape special regex characters in each word
	const escapeRegex = (str: string) => {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	};

	const escapedWords = wordList.map(escapeRegex);
	
	try {
		const wordRegex = new RegExp(escapedWords.join('|'), 'g');
		const matchedWords: Array<string> = [];
		const action = wordRegex.test(text) ? 'block' : 'pass';
		text = text.replace(wordRegex, function(match) {
			matchedWords.push(match);
			return '*'.repeat(match.length);
		});
		return { action, text, matchedWords };
	} catch (error) {
		// If regex creation fails, log error and return pass (don't block)
		console.error('[checkProhibitedWords] Invalid regex pattern:', error);
		return { action: 'pass', text, matchedWords: [] };
	}
}

export default checkProhibitedWords;
