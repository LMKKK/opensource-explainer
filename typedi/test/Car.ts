import { Service, Container, Inject } from '../src/index'
import { Engine } from './Engine'
@Service()
export class Car {
  engine: Engine;

  say(){
    console.log('car say: I am car')
  }
}