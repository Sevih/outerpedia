export {};
import { JSX } from "react/jsx-runtime";

// Fonction pour mettre en valeur certains mots-clés et les chiffres dans les descriptions
export function highlightNumbersOnly(text: string) {
    // Cette regex capture les nombres entiers ou décimaux, avec un éventuel % juste après
    const regex = /(\d+(?:\.\d+)?%?)/g;
  
    return text.split(regex).map((part, i) => {
      if (!part) return null;
      if (regex.test(part)) {
        return <span key={i} className="text-cyan-400 font-semibold">{part}</span>;
      } else {
        return part;
      }
    });
  }
  
  
export  function highlightKeywordsAndNumbers(text: string) {
    const keywords = ['Speed', 'Stealth', 'Attack', 'Defense', 'turn', 'debuff', 'buff', 'Revived', 'Resurrected', 'Penetration'];
    const regex = new RegExp(`(\\b(?:${keywords.join('|')})\\b|\\d+(?:\\.\\d+)?%?)`, 'gi');
  
    return text.split(regex).map((part, i) => {
      if (!part) return null;
  
      const keywordMatch = keywords.find(k => new RegExp(`^${k}s?$`, 'i').test(part));
      const numberMatch = /^\d+(\.\d+)?%?$/.test(part);
  
      if (keywordMatch) {
        return <span key={i} className="text-cyan-400 font-medium">{part}</span>;
      } else if (numberMatch) {
        return <span key={i} className="text-cyan-400 font-semibold">{part}</span>;
      } else {
        return part;
      }
    });
  }
  
  export function highlightDiff(base: string, mod: string): JSX.Element[] {
  const baseWords = base.split(/\s+/)
  const modWords = mod.split(/\s+/)

  return modWords.map((word, i) => {
    const same = baseWords[i] === word
    return (
      <span
        key={i}
        className={same ? '' : 'text-sky-400 font-semibold'}
      >
        {word + ' '}
      </span>
    )
  })
}
