import { registerDataDemos } from '@/demos/data';
import { registerInteractionDemos } from '@/demos/interactions';
import { registerNavigationDemos } from '@/demos/navigation';
import { registerScrollingDemos } from '@/demos/scrolling';
import { registerUtilityDemos } from '@/demos/utility';
import { registerValueDemos } from '@/demos/values';
import { registerUrlDemos } from '@/demos/url';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Root container #app not found');
}

const registrars = [
  registerNavigationDemos,
  registerScrollingDemos,
  registerInteractionDemos,
  registerUrlDemos,
  registerDataDemos,
  registerValueDemos,
  registerUtilityDemos
];

registrars.forEach((register) => register(app));
