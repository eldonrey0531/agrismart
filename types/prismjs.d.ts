declare module 'prismjs' {
  namespace Prism {
    function highlightElement(element: Element): void
    function highlight(text: string, grammar: any, language: string): string

    const languages: {
      [key: string]: any
    }

    interface Grammar {
      [key: string]: any
    }

    interface Token {
      type: string
      content: string | Token[]
      alias: string | string[]
      length: number
      greedy: boolean
    }

    interface Environment {
      element?: Element
      language?: string
      grammar?: Grammar
      code?: string
      highlightedCode?: string
      type?: string
      tag?: string
      classes?: string[]
      attributes?: { [key: string]: string }
      content?: string
      alias?: string | string[]
      parent?: Token | Environment
    }

    interface HookCallback {
      (env: Environment): void
    }

    interface Hooks {
      all: { [key: string]: HookCallback[] }
      add(name: string, callback: HookCallback): void
      run(name: string, env: Environment): void
    }

    const hooks: Hooks
  }

  export = Prism
}

declare module 'prismjs/components/prism-json' {}
declare module 'prismjs/components/prism-markup' {}
declare module 'prismjs/components/prism-csv' {}
declare module 'prismjs/themes/prism.css' {
  const content: string
  export default content
}