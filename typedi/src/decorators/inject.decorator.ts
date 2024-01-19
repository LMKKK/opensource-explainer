import { ContainerRegistry } from '../container-registry.class';
import { Token } from '../token.class';
import { CannotInjectValueError } from '../error/cannot-inject-value.error';
import { ServiceIdentifier } from '../types/service-identifier.type';
import { Constructable } from '../types/constructable.type';
import { resolveToTypeWrapper } from '../utils/resolve-to-type-wrapper.util';

/**
 * Injects a service into a class property or constructor parameter.
 * @Inject(identifier)装饰器, 实现 类属性或构造器参数的实例注入, 返回一个methodDecortor或者propertyDecorator
 */
export function Inject(): Function;
export function Inject(typeFn: (type?: never) => Constructable<unknown>): Function;
export function Inject(serviceName?: string): Function;
export function Inject(token: Token<unknown>): Function;
export function Inject(
  typeOrIdentifier?: ((type?: never) => Constructable<unknown>) | ServiceIdentifier<unknown>
): ParameterDecorator | PropertyDecorator {
  return function (target: Object, propertyName: string | Symbol, index?: number): void {
    const typeWrapper = resolveToTypeWrapper(typeOrIdentifier, target, propertyName, index);

    /** If no type was inferred, or the general Object type was inferred we throw an error. */
    // 如果没有推断出类型，或者推断出一般对象类型，抛出一个错误
    if (typeWrapper === undefined || typeWrapper.eagerType === undefined || typeWrapper.eagerType === Object) {
      throw new CannotInjectValueError(target as Constructable<unknown>, propertyName as string);
    }
    // 注册一个handler
    ContainerRegistry.defaultContainer.registerHandler({
      object: target as Constructable<unknown>, // 类的构造函数
      propertyName: propertyName as string, // 属性名
      index: index, // 构造参数的索引，若是实例属性，则为undefined
      value: containerInstance => { // 在指定Container上获取属性实例
        const evaluatedLazyType = typeWrapper.lazyType(); // 获取此属性的类型

        /** If no type was inferred lazily, or the general Object type was inferred we throw an error. */
        if (evaluatedLazyType === undefined || evaluatedLazyType === Object) {
          throw new CannotInjectValueError(target as Constructable<unknown>, propertyName as string);
        }

        return containerInstance.get<unknown>(evaluatedLazyType); // 返回此类型的实例
      },
    });
  };
}
