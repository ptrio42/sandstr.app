/**
 * YakiHonne Simulator — faithful reproduction of the real YakiHonne mobile app (Flutter).
 * Dark-first (OLED), ORANGE brand accent (#EE7700), article-centric, "Relay orbits",
 * Wallet-of-Satoshi, Yaki-chest dashboard. Reference: docs/refs/yakihonne/.
 *
 * @module simulators/yakihonne
 */

export { YakiHonneSimulator } from './YakiHonneSimulator';
export type { YakiHonneSimulatorProps, TabId } from './YakiHonneSimulator';

// Theme + tour styles
import './yakihonne.theme.css';
import '../../components/tour/tour.css';
