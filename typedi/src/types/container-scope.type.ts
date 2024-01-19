export type ContainerScope = 'singleton' | 'container' | 'transient';
// singleton: 单例，只会创建一个实例
// container: 容器，每个容器只会创建一个实例；当从指定的容器请求时，会创建一个实例
// transient: 瞬态，每次请求都会创建一个实例
