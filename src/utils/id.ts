let messageCounter = 0;
let sessionCounter = 0;

/**
 * Generates a collision-proof unique message ID.
 * Incorporates role prefix, millisecond timestamp, monotonic counter, and random entropy.
 */
export const generateUniqueMessageId = (role: 'user' | 'assistant' | 'sys' | 'msg' = 'msg'): string => {
  messageCounter += 1;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);
  return `${role}-${time}-${messageCounter}-${rand}`;
};

/**
 * Generates a collision-proof unique chat session ID.
 */
export const generateUniqueSessionId = (): string => {
  sessionCounter += 1;
  const time = Date.now();
  const rand = Math.random().toString(36).substring(2, 9);
  return `session-${time}-${sessionCounter}-${rand}`;
};
