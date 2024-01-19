import { ContainerInstance } from '../container-instance.class';
import { Constructable } from '../types/constructable.type';

/**
 * Used to register special "handler" which will be executed on a service class during its initialization.
 * It can be used to create custom decorators and set/replace service class properties and constructor parameters.
 */
export interface Handler<T = unknown> {
  /**
   * Service object used to apply handler to.
   * 目标的构造函数
   */
  object: Constructable<T>; 

  /**
   * Class property name to set/replace value of.
   * Used if handler is applied on a class property.
   * 成员名称
   */
  propertyName?: string;

  /**
   * Parameter index to set/replace value of.
   * Used if handler is applied on a constructor parameter.
   * 成员在构造函数参数中的索引
   */
  index?: number;

  /**
   * Factory function that produces value that will be set to class property or constructor parameter.
   * Accepts container instance which requested the value.
   * 工厂函数，返回值是从这个容器中获取的实例
   */
  value: (container: ContainerInstance) => any;
}
