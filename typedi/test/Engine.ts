import { Service, Container, Inject } from '../src/index'
import { Car } from './Car'
// Engine.ts
@Service()
export class Engine {
  @Inject()
  car: Car;

  say(){
    this.car.say()
    console.log('engine say: I am engine')
  }

}
