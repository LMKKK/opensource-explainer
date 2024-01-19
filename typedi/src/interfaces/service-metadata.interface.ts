import { ContainerInstance } from '../container-instance.class';
import { Constructable } from '../types/constructable.type';
import { ContainerIdentifier } from '../types/container-identifier.type';
import { ContainerScope } from '../types/container-scope.type';
import { ServiceIdentifier } from '../types/service-identifier.type';

/**
 * Service metadata is used to initialize service and store its state.
 */
export interface ServiceMetadata<Type = unknown> {
  /** Unique identifier of the referenced service. */
  id: ServiceIdentifier; // service的唯一标识

  /**
   * The injection scope for the service.
   *   - a `singleton` service always will be created in the default container regardless of who registering it
   *   - a `container` scoped service will be created once when requested from the given container
   *   - a `transient` service will be created each time it is requested
   */
  scope: ContainerScope; // 实例的作用域

  /**
   * Class definition of the service what is used to initialize given service.
   * This property maybe null if the value of the service is set manually.
   * If id is not set then it serves as service id.
   */
  type: Constructable<Type> | null; // 

  /**
   * Factory function used to initialize this service.
   * Can be regular function ("createCar" for example),
   * or other service which produces this instance ([CarFactory, "createCar"] for example).
   */
  factory: [Constructable<unknown>, string] | CallableFunction | undefined; // 此实例的工厂方法

  /**
   * Instance of the target class.
   * 目标类的实例
   */
  value: unknown | Symbol;

  /**
   * Allows to setup multiple instances the different classes under a single service id string or token.
   * 是否允许在同一个service id下注册多个实例
   */
  multiple: boolean;

  /**
   * Indicates whether a new instance should be created as soon as the class is registered.
   * By default the registered classes are only instantiated when they are requested from the container.
   *
   * _Note: This option is ignored for transient services._
   * 是否立即实例化，当为true，容器创建完成后就会实例化此类的bean；
   * 当为false，只有当用时才会实例化
   */
  eager: boolean;

  /**
   * Map of containers referencing this metadata. This is used when a container
   * is inheriting it's parents definitions and values to track the lifecycle of
   * the metadata. Namely, a service can be disposed only if it's only referenced
   * by the container being disposed.
   * 引用此类的metadata 的容器
   */
  referencedBy: Map<ContainerIdentifier, ContainerInstance>;
}
