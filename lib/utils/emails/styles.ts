/**
 * Email template styles using a mobile-first approach
 */

export const emailStyles = {
  // Container styles
  container: `
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #ffffff;
  `,

  // Header styles
  header: `
    text-align: center;
    padding: 20px 0;
    background-color: #f8f9fa;
    border-radius: 8px 8px 0 0;
  `,

  // Logo styles
  logo: `
    width: auto;
    height: 40px;
    margin: 0 auto;
  `,

  // Content styles
  content: `
    padding: 30px 20px;
    background-color: #ffffff;
  `,

  // Button styles
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  `,

  // Text styles
  heading: `
    color: #2d3748;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 20px 0;
    text-align: center;
  `,

  paragraph: `
    color: #4a5568;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  `,

  // Info box styles
  infoBox: `
    background-color: #ebf8ff;
    border: 1px solid #bee3f8;
    border-radius: 4px;
    padding: 16px;
    margin: 20px 0;
  `,

  // Warning box styles
  warningBox: `
    background-color: #fffbeb;
    border: 1px solid #fbd38d;
    border-radius: 4px;
    padding: 16px;
    margin: 20px 0;
  `,

  // Code box styles
  codeBox: `
    background-color: #2d3748;
    color: #ffffff;
    font-family: monospace;
    padding: 16px;
    border-radius: 4px;
    margin: 20px 0;
    text-align: center;
    font-size: 24px;
    letter-spacing: 4px;
  `,

  // Footer styles
  footer: `
    text-align: center;
    padding: 20px;
    color: #718096;
    font-size: 14px;
    border-top: 1px solid #e2e8f0;
    margin-top: 30px;
  `,

  // Link styles
  link: `
    color: #007bff;
    text-decoration: underline;
  `,

  // List styles
  list: `
    margin: 16px 0;
    padding-left: 20px;
  `,

  listItem: `
    margin: 8px 0;
    color: #4a5568;
  `,

  // Divider styles
  divider: `
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
  `,

  // Responsive container wrapper
  wrapper: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
      </head>
      <body style="margin:0;padding:0;word-spacing:normal;background-color:#f8f9fa;">
        <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
          {{content}}
        </div>
      </body>
    </html>
  `
}

/**
 * Wrap content with responsive email wrapper
 */
export function wrapEmailContent(content: string): string {
  return emailStyles.wrapper.replace('{{content}}', content)
}

/**
 * Create a styled button
 */
export function createButton(text: string, url: string, style = ''): string {
  return `
    <div style="text-align:center;margin:30px 0;">
      <a href="${url}" 
         target="_blank" 
         style="${emailStyles.button};${style}">
        ${text}
      </a>
    </div>
  `
}

/**
 * Create a code display box
 */
export function createCodeBox(code: string): string {
  return `
    <div style="${emailStyles.codeBox}">
      ${code}
    </div>
  `
}

export default emailStyles