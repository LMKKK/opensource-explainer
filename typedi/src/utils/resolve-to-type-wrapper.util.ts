import { Token } from '../token.class';
import { Constructable } from '../types/constructable.type';
import { ServiceIdentifier } from '../types/service-identifier.type';

/**
 * Helper function used in inject decorators to resolve the received identifier to
 * an eager type when possible or to a lazy type when cyclic dependencies are possibly involved.
 *
 * @param typeOrIdentifier a service identifier or a function returning a type acting as service identifier or nothing
 *                          服务标识符或返回作为服务标识符的类型的函数
 * @param target the class definition of the target of the decorator // 装饰器target的类定义
 * @param propertyName the name of the property in case of a PropertyDecorator // 即成员属性的name
 * @param index the index of the parameter in the constructor in case of ParameterDecorator // 即构造函数的参数的index索引
 */
export function resolveToTypeWrapper(
  typeOrIdentifier: ((type?: never) => Constructable<unknown>) | ServiceIdentifier<unknown> | undefined,
  target: Object,
  propertyName: string | Symbol,
  index?: number
): { eagerType: ServiceIdentifier | null; lazyType: (type?: never) => ServiceIdentifier } {
  /**
   * ? We want to error out as soon as possible when looking up services to inject, however
   * ? we cannot determine the type at decorator execution when cyclic dependencies are involved
   * ? because calling the received `() => MyType` function right away would cause a JS error:
   * ? "Cannot access 'MyType' before initialization", so we need to execute the function in the handler,
   * ? when the classes are already created. To overcome this, we use a wrapper:
   * ?  - the lazyType is executed in the handler so we never have a JS error
   * ?  - the eagerType is checked when decorator is running and an error is raised if an unknown type is encountered
   */
  let typeWrapper!: { eagerType: ServiceIdentifier | null; lazyType: (type?: never) => ServiceIdentifier };

  /** If requested type is explicitly set via a string ID or token, we set it explicitly. */
  if ((typeOrIdentifier && typeof typeOrIdentifier === 'string') || typeOrIdentifier instanceof Token) {
    typeWrapper = { eagerType: typeOrIdentifier, lazyType: () => typeOrIdentifier };
  }

  /** If requested type is explicitly set via a () => MyClassType format, we set it explicitly. */
  if (typeOrIdentifier && typeof typeOrIdentifier === 'function') {
    /** We set eagerType to null, preventing the raising of the CannotInjectValueError in decorators.  */
    typeWrapper = { eagerType: null, lazyType: () => (typeOrIdentifier as CallableFunction)() };
  }

  /** If no explicit type is set and handler registered for a class property, we need to get the property type. */
  // 如果没有指定service id, 获取此属性的类型
  if (!typeOrIdentifier && propertyName) {
    const identifier = (Reflect as any).getMetadata('design:type', target, propertyName);

    typeWrapper = { eagerType: identifier, lazyType: () => identifier };
  }

  /** If no explicit type is set and handler registered for a constructor parameter, we need to get the parameter types. */
  // 同理，如果是构造方法的参数，获取参数的类型
  if (!typeOrIdentifier && typeof index == 'number' && Number.isInteger(index)) {
    const paramTypes: ServiceIdentifier[] = (Reflect as any).getMetadata('design:paramtypes', target, propertyName);
    /** It's not guaranteed, that we find any types for the constructor. */
    const identifier = paramTypes?.[index];

    typeWrapper = { eagerType: identifier, lazyType: () => identifier };
  }

  return typeWrapper;
}
