import { Container } from "inversify";
import { configureAdapters } from './container/configure-adapters';
import { configureRepositories } from './container/configure-repositories';
import { configureUseCases } from './container/configure-use-cases';

/**
 * Single, shared Inversify container for the backend.
 *
 * This is the *composition root*: the only place where we wire
 * together domain/application interfaces (ports) with concrete
 * infrastructure implementations (adapters).
 *
 * All other layers use the exported `container` to resolve
 * dependencies by *interface type*, not by concrete class.
 */
export const container = new Container({
  defaultScope: "Transient",
});

export function configureContainer(): Container {
  configureAdapters()
  configureRepositories()
  configureUseCases()

  return container;
}