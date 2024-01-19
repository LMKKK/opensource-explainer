import { ValidatorOptions } from 'class-validator';
import { ActionMetadata } from './ActionMetadata';
import { ParamMetadataArgs } from './args/ParamMetadataArgs';
import { ParamType } from './types/ParamType';
import { ClassTransformOptions } from 'class-transformer';
import { Action } from '../Action';

/**
 * Action Parameter metadata.
 */
export class ParamMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Parameter's action.
   * 该参数所在Action的完整的metadata引用
   */
  actionMetadata: ActionMetadata;

  /**
   * Object on which's method's parameter this parameter is attached.
   * 所在的类，即构造函数
   */
  object: any;

  /**
   * Method on which's parameter is attached.
   * 参数所在方法的名称
   */
  method: string;

  /**
   * Index (# number) of the parameter in the method signature.
   * 参数的索引值，从0开始
   */
  index: number;

  /**
   * Parameter type.
   * routing-controllers中对参数规定的类型
   */
  type: ParamType;

  /**
   * Parameter name.
   * 参数名
   */
  name: string;

  /**
   * Parameter target type.
   * 参数的类型
   */
  targetType?: any;

  /**
   * Parameter target type's name in lowercase.
   * 参数名(转换为小写)
   */
  targetName: string = '';

  /**
   * Indicates if target type is an object.
   */
  isTargetObject: boolean = false;

  /**
   * Parameter target.
   */
  target: any;

  /**
   * Specifies if parameter should be parsed as json or not.
   */
  parse: boolean;

  /**
   * Indicates if this parameter is required or not
   * 标记此参数是否是 必选项
   */
  required: boolean;

  /**
   * Transforms the value.
   */
  transform: (action: Action, value?: any) => Promise<any> | any;

  /**
   * If true, string values are cast to arrays
   */
  isArray?: boolean;

  /**
   * Additional parameter options.
   * For example it can be uploader middleware options or body-parser middleware options.
   */
  extraOptions: any;

  /**
   * Class transform options used to perform plainToClass operation.
   */
  classTransform?: ClassTransformOptions;

  /**
   * If true, class-validator will be used to validate param object.
   * If validation options are given then it means validation will be applied (is true).
   */
  validate?: boolean | ValidatorOptions;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(actionMetadata: ActionMetadata, args: ParamMetadataArgs) {
    this.actionMetadata = actionMetadata;

    this.target = args.object.constructor;
    this.method = args.method;
    this.extraOptions = args.extraOptions;
    this.index = args.index;
    this.type = args.type;
    this.name = args.name;
    this.parse = args.parse;
    this.required = args.required;
    this.transform = args.transform;
    this.classTransform = args.classTransform;
    this.validate = args.validate;
    this.isArray = args.isArray;

    if (args.explicitType) {
      this.targetType = args.explicitType;
    } else {
      const ParamTypes = (Reflect as any).getMetadata('design:paramtypes', args.object, args.method);
      if (typeof ParamTypes !== 'undefined') {
        this.targetType = ParamTypes[args.index];
      }
    }

    if (this.targetType) {
      if (this.targetType instanceof Function && this.targetType.name) {
        this.targetName = this.targetType.name.toLowerCase();
      } else if (typeof this.targetType === 'string') {
        this.targetName = this.targetType.toLowerCase();
      }
      this.isTargetObject = this.targetType instanceof Function || this.targetType.toLowerCase() === 'object';
    }
  }
}
