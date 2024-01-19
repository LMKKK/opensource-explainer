## 简介

typedi是一个基于TS的装饰器和reflect-metadata的依赖注入轻量级框架，使用简单易懂，方便拓展。

使用typedi的前提是安装`reflect-metadata`，并在项目的入口文件的第一行中声明`import ‘reflect-metadata’`，这样就会在原生的Reflect API上挂载metadata操作相关的API。

前提

1. 项目中引入reflect-metadata依赖

```sh
pnpm add reflect-metadata
```

2. 在项目的入口文件的第一行声明

```ts
import 'reflect-metadata'
```

3. 在tsconfig.json中开启装饰器语法和装饰器元数据

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

当开启了`emitDecoratorMetadata`后，TS会自动为装饰器生成metadata，有3个metadata：

- `design:type` 被装饰器修饰的目标的类型，即成员的类型
- `design:paramtypes` 方法的参数的类型集合，是一个数组，只有被修饰是方法时，此metadata才有效，否则就是undefined
- `design:returntype` 方法的返回值类型，只有方法独有的metadata



安装typedi

```sh
pnpm add typedi
```



## 注册实例到容器中

typedi是基于IOC和DI的思想，因此需要有一个容器来容纳所有的bean

有三种方式注册你的实例到容器Container中：

- 使用`@Service()`修饰的类(声明式)
- 用`Token`注册一个实例(手动式)
- 用字符串来注册一个实例(手动式)

`Token`和字符串标识符可以用来注册类以外的其他值。`Token`和字符串标识符都可以注册任何类型的值，包括除`undefined`之外的原始值。它们必须在容器上用`Container.set()`函数设置，然后才能通过`Container.get()`请求它们。

使用`@Service`注入：

```ts
import 'reflect-metadata'
import { Service, Container } from 'typedi'

@Service()
class Person {
  name: string = 'John'
  age: number = 30
}

const obj = Container.get(Person) as Person

console.log(obj)
// Person { name: 'John', age: 30 }
```

使用`Token`或字符串注入：

```ts
import 'reflect-metadata'
import { Service, Container, Token } from 'typedi'

Container.set('message', 'Hello World')
console.log(Container.get('message')) // Hello World

const token = new Token('TOKEN_INDEX')
Container.set(token, 'Nice to meet you!')
console.log(Container.get(token)) // Nice to meet you!
```



## 依赖注入

三种方式注入依赖的实例：

- 通过类的构造函数参数自动注入
- 使用`@Inject()`装饰器来标注需要注入的属性
- 直接使用`Container.get()`来获取实例，手动注入



构造函数参数注入

```ts
import 'reflect-metadata'
import { Service, Container, Token } from 'typedi'

@Service()
class A {
  say(){
    console.log('A ...')
  }
}

@Service()
class B {
  constructor(public a: A){}

  say(){
    console.log('B ...')
    this.a.say()
  }
}

const b = Container.get(B) as B
b.say()
// B ...
// A ...
```



`@Inject()`属性注入

```ts
import 'reflect-metadata'
import { Service, Container, Token, Inject } from 'typedi'

@Service()
class A {
  say(){
    console.log('A ...')
  }
}

@Service()
class B {

  @Inject()
  a: A

  say(){
    console.log('B ...')
    this.a.say()
  }
}

const b = Container.get(B) as B
b.say()
// B ...
// A ...
```



### bean的作用域

默认注入到容器中的实例都是单例的，即每次从容器中获取的对象都是同一个对象

```ts
import 'reflect-metadata'
import { Service, Container, Token, Inject } from 'typedi'

@Service()
class Person {
  name = 'John Doe'
  age = 21
}

const obj1 = Container.get(Person)
const obj2 = Container.get(Person)
// 判断两个对象是否是同一个对象
console.log(obj1 === obj2) // true
```

如果想要每次请求容器时，都会得到一个新的对象，可以这样做

```ts
import 'reflect-metadata'
import { Service, Container, Token, Inject } from 'typedi'

@Service({ transient: true })
class Person {
  name = 'John Doe'
  age = 21
}

const obj1 = Container.get(Person)
const obj2 = Container.get(Person)
// 判断两个对象是否是同一个对象
console.log(obj1 === obj2) // false
```



## @Inject

`@Inject`是一个属性和参数装饰器，用于**解决一个类的属性或构造函数参数的依赖**

默认情况下，他能推断出属性或参数的类型，并初始化一个检测到的类型的实例，然而这种行为可以通过指定一个自定义的可构造类型、Token或已命名的Service作为第一个参数 来覆盖



### 属性注入

属性的类型是自动推断出来的，所以不需要定义所需的值来作为装饰器的参数

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  withDecorator: InjectedExampleClass;

  withoutDecorator: InjectedExampleClass;
}

const instance = Container.get(ExampleClass);

/**
 * `instance`变量是一个ExampleClass实例
 * 其`withDecorator`属性包含一个InjectedExampleClass实例
 * 而`withoutDecorator`属性undefined
 */
console.log(instance);

instance.withDecorator.print();
// "I am alive!" (InjectedExampleClass.print 方法)
console.log(instance.withoutDecorator);
// undefined, 因为这个属性没有用@Inject装饰器标记
```

### 构造函数注入

构造函数注入，**当一个类被`@Service`装饰器标注时，在构造器注入中不需要`@Inject`装饰器**，TS会自动推断并为每个构造参数注入正确的类实例。

**但是注意，`@Inject`可以用来覆盖注入的类型**

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  constructor(
    @Inject()
    public withDecorator: InjectedExampleClass,
    public withoutDecorator: InjectedExampleClass
  ) {}
}

const instance = Container.get(ExampleClass);

/**
 * `instance'变量是一个ExampleClass实例
 * 它同时具有
`withDecorator`和`withoutDecorator`属性
 * 都包含一个
InjectedExampleClass实例。
 */
console.log(instance);

instance.withDecorator.print();
// 输出 "I am alive!" (InjectedExampleClass.print function)
instance.withoutDecorator.print();
// 输出 "I am alive!" (InjectedExampleClass.print function)
```



### 明确请求目标类型

默认情况下，TypeDI将尝试推断属性和参数的类型并注入适当的类实例。当必要时，可以覆盖注入值的类型：

- 通过`@Inject( () => type)`，其中`type`是一个可构造的值（例如，一个类的定义）
- 通过`@Inject(myToken)`，其中`myToken`是一个`Token`类的实例
- 通过`@Inject(serviceName)`，其中`serviceName`是一个字符串，已经通过`Container.set(serviceName, value)`注册过了

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class BetterInjectedClass {
  print() {
    console.log('I am a different class!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  inferredPropertyInjection: InjectedExampleClass;

  /**
   * 我们告诉TypeDI，用`BetterInjectedClass`类初始化。
   * 不管推断的类型是什么。
   */
  @Inject(() => BetterInjectedClass)
  explicitPropertyInjection: InjectedExampleClass;

  constructor(
    public inferredArgumentInjection: InjectedExampleClass,
    /**
     * 我们告诉TypeDI，用`BetterInjectedClass`类初始化。
     * 不管推断的类型是什么。
     */
    @Inject(() => BetterInjectedClass)
    public explicitArgumentInjection: InjectedExampleClass
  ) {}
}

/**
 * `instance`变量是一个 ExampleClass 的实例，同时具有
 * - `inferredPropertyInjection` 和 `inferredArgumentInjection` 属性
 * 都包含一个`InjectedExampleClass`实例
 * - `explicitPropertyInjection`和`explicitArgumentInjection`属性
 * 都包含一个`BetterInjectedClass'实例。
 */
const instance = Container.get(ExampleClass);

instance.inferredPropertyInjection.print();
// "I am alive!" (InjectedExampleClass.print function)
instance.explicitPropertyInjection.print();
// "I am a different class!" (BetterInjectedClass.print function)
instance.inferredArgumentInjection.print();
// "I am alive!" (InjectedExampleClass.print function)
instance.explicitArgumentInjection.print();
// "I am a different class!" (BetterInjectedClass.print function)
```

### 循环依赖

依赖注入最常见的问题就是循环依赖，因此为了避免循环依赖，我们需要为属性指明类型
在循环依赖的情况下，TS无法推断出属性的类型，就导致`design:type`为undefined，typedi就无法实例化，因此我们需要强制给出类型。
```ts
// Car.ts
@Service()
export class Car {
  @Inject(type => Engine)
  engine: Engine;
}

// Engine.ts
@Service()
export class Engine {
  @Inject(type => Car)
  car: Car;
}
```
**注意这种方式只能解决属性注入，不能解决构造参数的注入。**

需要注意的是，通常循环依赖意味着：
1. 模块间的指责分工不明
2. 单个模块的指责过多(不满足单一职责原则)
3. 缺少合理的抽象层

## Service Token

在使用`@Service()`来注入一个实例到Container中时，我们可以给出`@Service()`参数，用来唯一标识这个实例，参数类型通常是字符串或Token类型。

### 使用字符串

```ts
import 'reflect-metadata'
import { Service, Token, Container, Inject } from 'typedi'

@Service('userComponet')
class Person {
  name = 'john'
}

@Service('userIndex')
class PersonController {
  
  @Inject('userComponet')
  obj: Person

  say(){
    console.log('userIndex ... ',this.obj.name)
  }
}

console.log((Container.get('userComponet') as Person).name); // john

(Container.get('userIndex') as PersonController).say() // userIndex ... john
```



### 使用Token

Service Token 可以用来标识Container中唯一的一个实例，可以安全地从Container中获取Bean

```ts
import 'reflect-metadata';
import { Container, Token } from 'typedi';

export const JWT_SECRET_TOKEN = new Token<string>('MY_SECRET');

Container.set(JWT_SECRET_TOKEN, 'wow-such-secure-much-encryption');

/**
 * 这个值是类型安全的，因为Token是类型化的。
 */
const JWT_SECRET = Container.get(JWT_SECRET_TOKEN);
console.log(JWT_SECRET)
```

可以与`@Inject()`搭配使用，覆盖属性或参数的推断类型

```ts
import 'reflect-metadata';
import { Container, Token, Inject, Service } from 'typedi';

export const JWT_SECRET_TOKEN = new Token<string>('MY_SECRET');

Container.set(JWT_SECRET_TOKEN, 'wow-such-secure-much-encryption');

@Service()
class Example {
  @Inject(JWT_SECRET_TOKEN)
  myProp: string;
}

const instance = Container.get(Example);
// instance.myProp属性有为Token分配的值。
```



### 同名的Token

两个具有相同名称的Token是不同的Token，一个Token实例是唯一的，类似于Symbol类型。

```ts
import 'reflect-metadata';
import { Container, Token } from 'typedi';

const tokenA = new Token('TOKEN');
const tokenB = new Token('TOKEN');

Container.set(tokenA, 'value-A');
Container.set(tokenB, 'value-B');

const tokenValueA = Container.get(tokenA);
// tokenValueA 是 "value-A"
const tokenValueB = Container.get(tokenB);
// tokenValueB 是 "value-B"

console.log(tokenValueA === tokenValueB);
// false
```



### Token和字符串的对比

Token和字符串都可以用来标识一个Service实例，但是推荐使用Token，因为Token是类型安全的，而同一个string的名称真的就是唯一表示Service实例。



## 继承性

当基类和继承类都被标记为`@Service()`后，属性是支持继承性的。

在创建时，继承有装饰属性的类将收到这些属性上的初始化实例。

**即当子类继承了父类的依赖注入的属性时，子类中的此属性也是可以直接使用的**

```ts
import 'reflect-metadata';
import { Container, Token, Inject, Service } from 'typedi';

@Service()
class InjectedClass {
  name: string = 'InjectedClass';
}

@Service()
class BaseClass {
  name: string = 'BaseClass';

  @Inject()
  injectedClass: InjectedClass;
}

@Service()
class ExtendedClass extends BaseClass {
  name: string = 'ExtendedClass';
}

const instance = Container.get(ExtendedClass);

console.log(instance.injectedClass.name);
// 输出"InjectedClass"
console.log(instance.name);
// 输出 "ExtendedClass"
```


## 参考文章

https://static.kancloud.cn/czkme/dependency-inject/2511047


# 源码解读

## 原理说明
依赖注入的核心就是容器Container
`Container.set(id, value)`向容器中push一个实例
`Container.get(id)`从容器中get一个实例

Container容器对象中的核心概念：
- ServiceMetadata,被容器接管的每个类都叫做一个Service，ServiceMetadata就是这个类对应的信息，每个类都有一个与之对应的ServiceMetadata实例
- metadataMap,是一个map，保存的是某一个类的配置信息
- handlers，是一个数组，所有`@Inject()`的属性都是一个handler，表示待注入的属性。此容器接管的所有类中的@Inject()标注的属性都在这个数组中

按照装饰器的执行顺序，一个类中的@Inject()先执行，然后是@Service()
@Inject可以用在属性和构造参数上。

看一下ServiceMetadata的结构
```ts
export interface ServiceMetadata<Type = unknown> {
  // service的唯一标识，
  id: string | Token | Constructable | AbstractConstructor | CallableFunction; 

  /**
   * 实例的作用域
   *  singleton 单例模式， 单例的实例会被放在default容器中
   *  container 从指定容器中创建实例，从此容器中也是单例的
   *  transient 瞬时的，每次从容器请求都会创建一个新的实例
   */
  scope: 'singleton' | 'container' | 'transient'; 

  // Service的类型，就是构造函数类型
  type: Constructable<Type> | null; 

  // 创建此类型实例的工厂，
  factory: [Constructable<unknown>, string] | CallableFunction | undefined; // 此实例的工厂方法

  // 目标类的实例
  value: unknown | Symbol;

  // 是否允许在同一个service id下注册多个实例
  multiple: boolean;

  /**
   * 是否立即实例化，当为true，容器创建完成后就会实例化此类的bean；
   * 当为false，只有当用时才会实例化
   */
  eager: boolean;

  /**
   * 引用此类的 metadata 的容器
   */
  referencedBy: Map<ContainerIdentifier, ContainerInstance>;
}
```

## @Inject的原理
首先要清楚@Inject()的用法：
- @Inject()中可以给Service的id，用来指定注入特定的实例
- @Inject()中的参数还可以是一个函数，用来强制修改要注入的类型

一个Handler的结构
```ts
export interface Handler<T = unknown> {
  // 属性所在的类(构造函数)，即此属性需要注入的目标类
  object: Constructable<T>; 

  // 成员名称
  propertyName?: string;

  // 成员在构造函数参数中的索引，
  // 若@Inject()标注的是类中实例属性，则此属性为undefined
  index?: number;

  // 一个方法，在@Inject()中已经实现了，从指定的容器中获取此属性的实例
  value: (container: ContainerInstance) => any;
}
```

当在一个属性上标注了@Inject()后，实际上就发生了一件事情，**向容器中注入一个此属性的handler**

![20240117154925](https://kkbank.oss-cn-qingdao.aliyuncs.com/note-img/20240117154925.png)

## @Service发生了什么
@Service()发生了两件事：
1. 初始化此class的ServiceMetadata
2. 向Container.metadataMap()中push这个ServiceMetadata
看图
![20240117155904](https://kkbank.oss-cn-qingdao.aliyuncs.com/note-img/20240117155904.png)

## Container.get(id)
`Container.get(id)`是从容器中获取实例，在这个步骤中完成了类的实例化。
这个框架的核心就是get()方法
![20240117163134](https://kkbank.oss-cn-qingdao.aliyuncs.com/note-img/20240117163134.png)


## 总结
基于Container的依赖注入，无非就是两件事，向Container中push实例和从Container中get实例。
typedi采用了惰性加载的方式，初始只保存类的metadata(类的配置信息)，
Container.get()时才会对类进行实例化，而在类实例化的过程中，如果检测都有需要注入的属性，则会继续调用Container.get()来实例化属性，经典的递归形式；后续如果如果要获取某个实例，判断已经实例化了直接返回，就不需要继续实例化了

typedi这个框架设计非常小巧强悍，代码简洁，支持自定义拓展。
