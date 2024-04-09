/**
 * Controller action properties.
 */
export interface Action {
  /**
   * Action Request object.
   * 本次request实例
   */
  request: any;

  /**
   * Action Response object.
   * 本次response实例
   */
  response: any;

  /**
   * Content in which action is executed.
   * Koa-specific property.
   * Koa的请求上下文实例
   */
  context?: any;

  /**
   * "Next" function used to call next middleware.
   * 下一个继续处理的中间件
   */
  next?: Function;
}
