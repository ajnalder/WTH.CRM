
export const gradients = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-red-400 to-red-600',
  'from-yellow-400 to-yellow-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
  'from-orange-400 to-orange-600',
  'from-cyan-400 to-cyan-600',
  'from-lime-400 to-lime-600',
  'from-rose-400 to-rose-600',
];

export const getInitials = (name: string) => {
  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);
  
  if (words.length === 1) {
    // Single word: use first 2 letters
    return trimmedName.substring(0, 2).toUpperCase();
  } else {
    // Multiple words: use first letter of each word (up to 2)
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }
};

export const getRandomGradient = () => {
  return gradients[Math.floor(Math.random() * gradients.length)];
};
