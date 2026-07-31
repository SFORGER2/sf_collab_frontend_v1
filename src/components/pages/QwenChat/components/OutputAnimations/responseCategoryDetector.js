/**
 * Response Category Detector
 * Evaluates live streamed content buffer tokens deterministically to classify response type.
 */
export function detectResponseCategory(content = '') {
  const text = (content || '').trim();
  const lower = text.toLowerCase();

  // Stage 1: Universal Thinking State (No content tokens arrived yet)
  if (!text) {
    return 'pending';
  }

  // Stage 2: Live Content Token Syntax Matching

  // 1. Specific fenced code blocks — matched BEFORE generic code fallback
  if (lower.startsWith('```json')) {
    return 'json';
  }
  if (lower.startsWith('```csv')) {
    return 'csv';
  }
  if (lower.startsWith('```bash') || lower.startsWith('```sh') || lower.startsWith('```terminal') || lower.startsWith('```zsh') || lower.startsWith('```cmd') || lower.startsWith('```powershell') || lower.startsWith('```console')) {
    return 'terminal';
  }
  if (lower.startsWith('```mermaid')) {
    return 'mermaid';
  }
  // Generic code block (any other language)
  if (lower.startsWith('```')) {
    return 'code';
  }

  // 2. JSON Structure (starts with { or [)
  if (text.startsWith('{') || text.startsWith('[')) {
    return 'json';
  }

  // 3. Data Tables (starts with | or contains markdown table syntax)
  if (text.startsWith('|') || text.includes('|---|') || text.includes('| :---') || text.includes('|:---')) {
    return 'table';
  }

  // 4. CLI Terminal Output (starts with $ or docker/npm logs)
  if (text.startsWith('$ ') || lower.startsWith('$ docker') || lower.startsWith('$ npm')) {
    return 'terminal';
  }

  // 5. Mermaid Diagram (starts with graph TD or ```mermaid)
  if (lower.startsWith('graph td') || lower.startsWith('```mermaid') || lower.includes('sequencediagram')) {
    return 'mermaid';
  }

  // 6. Mathematics (starts with $, \[, $$ or LaTeX formulas)
  if (text.startsWith('$') || text.startsWith('\\[') || text.includes('$$') || text.includes('\\frac')) {
    return 'mathematics';
  }

  // 7. Image Synthesis (starts with ![ or Synthesizing Image)
  if (text.startsWith('![') || lower.startsWith('synthesizing image') || lower.startsWith('[image:')) {
    return 'image';
  }

  // 8. File Attachment Document (starts with [File: or [Document: or [Attachment:)
  if (text.startsWith('[File:') || text.startsWith('[Document:') || text.startsWith('[Attachment:')) {
    return 'file';
  }

  // 9. Markdown Formatting & Long Explanation (starts with #, >, -, *, or explain/describe/what is prompts)
  if (text.startsWith('#') || text.startsWith('>') || text.startsWith('- ') || text.startsWith('* ') || lower.startsWith('explain') || lower.startsWith('what is') || lower.startsWith('describe')) {
    return 'long_explanation';
  }

  // 10. Mixed Response (prose narrative followed by an embedded code fence)
  const codeFenceIndex = text.indexOf('```');
  if (codeFenceIndex > 20) {
    return 'mixed';
  }

  // 11. Plain Text / Standard Conversation
  return 'plain_text';
}
