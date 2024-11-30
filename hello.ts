class Hello {
  constructor(private _message: string) {}

  get message() {
    return this._message;
  }
}

const hello = new Hello("Hello, World!");
console.log(hello.message);
