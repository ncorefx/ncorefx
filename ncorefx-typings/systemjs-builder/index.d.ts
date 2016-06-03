declare module 'systemjs-builder' {
  class Builder {
    constructor(baseUrl?: string, configObject?: any);
    bundle(source: string, target: string, options?: any): Promise<any>;
    buildStatic(source: string, target: string, options?: any): Promise<any>;
  }

  module Builder {}
  export = Builder;
}