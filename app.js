// name=app.js
const STORAGE_KEY = 'n5_mastery_streak_progress';

function getCombinedDataset() {
    // Tag items and ensure a 'japanese' property exists for consistent tracking keys
    const vocab = typeof vocabData !== 'undefined' ? 
        vocabData.map(item => ({ ...item, type: 'vocab', japanese: item.japanese || item.word })) : [];
        
    const kanji = typeof kanjiData !== 'undefined' ? 
        kanjiData.map(item => ({ ...item, type: 'kanji', japanese: item.japanese || item.kanji })) : [];

    const verbs = typeof dictData !== 'undefined' ? 
        dictData.map(item => ({ ...item, type: 'verb', japanese: item.japanese })) : [];
        
    return [...vocab, ...kanji, ...verbs];
}

function getProgress() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function recordAttempt(japaneseWord, isCorrect, isFirstTry = false) {
    let progress = getProgress();
    if (!progress[japaneseWord]) {
        progress[japaneseWord] = { attempts: 0, correct: 0, incorrect: 0, streak: 0 };
    }
    
    progress[japaneseWord].attempts += 1;
    if (isCorrect) {
        progress[japaneseWord].correct += 1;
        progress[japaneseWord].streak += 1;
        
        if (isFirstTry) {
            progress[japaneseWord].incorrect = 0; // Clear failure history if nailed first try
        }
    } else {
        progress[japaneseWord].incorrect += 1;
        progress[japaneseWord].streak = 0;
    }
    saveProgress(progress);
}

function getWordStatus(japaneseWord) {
    const progress = getProgress();
    const stats = progress[japaneseWord];
    
    if (!stats || stats.attempts === 0) return 'Unseen';
    if (stats.streak >= 3) return 'Mastered';
    if (stats.incorrect > 0) return 'Troublesome';
    return 'Learning';
}

function getOverallStats() {
    const items = getCombinedDataset();
    
    let stats = {
        overall: { total: items.length, mastered: 0, learning: 0, unseen: 0, percentage: 0 },
        vocab: { total: 0, mastered: 0, learning: 0, unseen: 0, percentage: 0 },
        kanji: { total: 0, mastered: 0, learning: 0, unseen: 0, percentage: 0 },
        verb: { total: 0, mastered: 0, learning: 0, unseen: 0, percentage: 0 }
    };

    items.forEach(word => {
        const status = getWordStatus(word.japanese);
        const type = word.type || 'vocab';

        if (status === 'Mastered') stats.overall.mastered++;
        else if (status === 'Learning' || status === 'Troublesome') stats.overall.learning++;
        else stats.overall.unseen++;

        if (stats[type]) {
            stats[type].total++;
            if (status === 'Mastered') stats[type].mastered++;
            else if (status === 'Learning' || status === 'Troublesome') stats[type].learning++;
            else stats[type].unseen++;
        }
    });

    stats.overall.percentage = Math.round((stats.overall.mastered / Math.max(stats.overall.total, 1)) * 100) || 0;
    stats.vocab.percentage = Math.round((stats.vocab.mastered / Math.max(stats.vocab.total, 1)) * 100) || 0;
    stats.kanji.percentage = Math.round((stats.kanji.mastered / Math.max(stats.kanji.total, 1)) * 100) || 0;
    stats.verb.percentage = Math.round((stats.verb.mastered / Math.max(stats.verb.total, 1)) * 100) || 0;

    return stats;
}

function getLessonStats() {
    const items = getCombinedDataset();
    const lessonMap = {};

    items.forEach(word => {
        const type = word.type || 'vocab';
        const rawId = word.lesson || word.category || 'All'; 
        const mapKey = `${type}-${rawId}`;

        if (!lessonMap[mapKey]) {
            lessonMap[mapKey] = { 
                id: rawId, 
                type: type,
                name: word.lessonName || '', 
                total: 0, 
                mastered: 0 
            };
        }
        
        lessonMap[mapKey].total++;
        if (getWordStatus(word.japanese) === 'Mastered') {
            lessonMap[mapKey].mastered++;
        }
    });

    return Object.values(lessonMap).sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        
        const numA = parseInt(a.id);
        const numB = parseInt(b.id);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a.id).localeCompare(String(b.id));
    });
}

function getTroublesomeWords() {
    const progress = getProgress();
    const list = [];
    const items = getCombinedDataset();

    items.forEach(word => {
        const stats = progress[word.japanese];
        if (stats && stats.incorrect > 0) {
            const errorRate = stats.incorrect / stats.attempts;
            list.push({ ...word, errorRate, stats });
        }
    });

    return list.sort((a, b) => b.errorRate - a.errorRate || b.stats.incorrect - a.stats.incorrect);
}

function speakJapanese(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
    }
}