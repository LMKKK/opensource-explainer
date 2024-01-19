import { ContainerRegistry } from '../container-registry.class';
import { ServiceMetadata } from '../interfaces/service-metadata.interface';
import { ServiceOptions } from '../interfaces/service-options.interface';
import { EMPTY_VALUE } from '../empty.const';
import { Constructable } from '../types/constructable.type';

/**
 * Marks class as a service that can be injected using Container.
 */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export function Service<T = unknown>(): Function;
export function Service<T = unknown>(options: ServiceOptions<T>): Function;
export function Service<T>(options: ServiceOptions<T> = {}): ClassDecorator {
  // 类装饰器只接受一个参数，就是类的构造函数
  return targetConstructor => {
    const serviceMetadata: ServiceMetadata<T> = {
      id: options.id || targetConstructor, // 如果没有传入id，就用类的构造函数作为id
      type: targetConstructor as unknown as Constructable<T>, // 类的构造函数
      factory: (options as any).factory || undefined,
      multiple: options.multiple || false,
      eager: options.eager || false,
      scope: options.scope || 'container', // 默认是container
      referencedBy: new Map().set(ContainerRegistry.defaultContainer.id, ContainerRegistry.defaultContainer),
      value: EMPTY_VALUE, // 默认是空值， 代表此类没有被初始化
    };

    ContainerRegistry.defaultContainer.set(serviceMetadata);
  };
}
