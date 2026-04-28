/**
 * useTypewriter — custom hook that cycles through an array of phrases
 * with a typewriter typing-and-deleting effect.
 *
 * @param {string[]} words       - phrases to cycle through
 * @param {number}   typingSpeed - ms per character while typing (default 90)
 * @param {number}   deletingSpeed - ms per character while deleting (default 45)
 * @param {number}   pauseMs    - ms to hold the completed word before deleting (default 1800)
 * @returns {string} the current display string
 */
import { useState, useEffect, useRef } from 'react';

export default function useTypewriter(
    words,
    typingSpeed = 90,
    deletingSpeed = 45,
    pauseMs = 1800
) {
    const [display, setDisplay] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const pauseRef = useRef(null);

    useEffect(() => {
        const current = words[wordIndex % words.length];
        const delay = isDeleting ? deletingSpeed : typingSpeed;

        const timer = setTimeout(() => {
            if (!isDeleting) {
                // Typing forward — add one more character
                setDisplay(current.slice(0, charIndex + 1));

                if (charIndex + 1 === current.length) {
                    // We finished typing the word — pause, then start deleting
                    pauseRef.current = setTimeout(() => setIsDeleting(true), pauseMs);
                } else {
                    setCharIndex((c) => c + 1);
                }
            } else {
                // Deleting backward — remove one character
                setDisplay(current.slice(0, charIndex - 1));

                if (charIndex - 1 === 0) {
                    // Word fully deleted — move to next word
                    setIsDeleting(false);
                    setWordIndex((i) => (i + 1) % words.length);
                    setCharIndex(0);
                } else {
                    setCharIndex((c) => c - 1);
                }
            }
        }, delay);

        return () => {
            clearTimeout(timer);
            clearTimeout(pauseRef.current);
        };
    }, [charIndex, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

    return display;
}
