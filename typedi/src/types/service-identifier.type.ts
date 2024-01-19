import { Token } from '../token.class';
import { Constructable } from './constructable.type';
import { AbstractConstructable } from './abstract-constructable.type';

/**
 * Unique service identifier.
 * Can be some class type, or string id, or instance of Token.
 * Service的唯一标识
 */
export type ServiceIdentifier<T = unknown> =
  | Constructable<T> // 构造函数
  | AbstractConstructable<T> // 抽象构造函数
  | CallableFunction // 可调用函数
  | Token<T>  //  token
  | string; // 字符串
