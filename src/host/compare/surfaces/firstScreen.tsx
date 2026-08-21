/**
 * Surface: the first screen — what each client asks of you before you can look
 * at anything.
 *
 * This is the surface that maps straight onto the two hardest axes in the
 * matrix (`signer`, `read-only`) and onto the biggest topic on #asknostr after
 * zaps: keys and accounts. The differences are not cosmetic. Coracle has no
 * field to paste a secret key into at all. YakiHonne offers "Continue as a
 * guest". Damus opens on two buttons and wants the nsec itself.
 *
 * SECURITY NOTE, carried over from the simulators themselves: several of these
 * screens deliberately diverge from the real client by refusing real secret
 * keys (`keySafety.ts`), and Snort's ships no key field at all where the real
 * one auto-submits a pasted bech32 string. Those divergences are documented in
 * each screen; this page shows the screens as sandstr ships them.
 */
import { LoginScreen as DamusLogin } from '../../../simulators/damus/screens/LoginScreen';
import { LoginScreen as AmethystLogin } from '../../../simulators/amethyst/screens/LoginScreen';
import { LoginScreen as PrimalLogin } from '../../../simulators/primal/web/screens/LoginScreen';
import { LoginScreen as YakiLogin } from '../../../simulators/yakihonne/screens/LoginScreen';
import { LoginScreen as SnortLogin } from '../../../simulators/snort/screens/LoginScreen';
import { LoginScreen as WispLogin } from '../../../simulators/wisp/screens/LoginScreen';
import { WelcomeScreen as NosturWelcome } from '../../../simulators/nostur/screens/WelcomeScreen';
import { LoginScreen as CoracleLogin } from '../../../simulators/coracle/screens/LoginScreen';
import { HomeScreen as BorisHome } from '../../../simulators/boris/screens/HomeScreen';

import { PHONE, WEB, type Surface, type SurfacePreviewProps } from './types';

const noop = () => {};

function DamusFirst() { return <DamusLogin onLogin={noop} />; }
function AmethystFirst() { return <AmethystLogin onLogin={noop} />; }
function PrimalFirst() { return <PrimalLogin onLogin={noop} theme="dark" />; }
function YakiFirst() { return <YakiLogin onSignIn={noop} onSignUp={noop} onGuest={noop} />; }
function SnortFirst({ users }: SurfacePreviewProps) { return <SnortLogin onLogin={noop} users={users} />; }
function WispFirst() { return <WispLogin onLogin={noop} />; }
function NosturFirst() { return <NosturWelcome onLogin={noop} />; }
function CoracleFirst() {
  return <CoracleLogin onLogin={noop} onSignUp={noop} onRemoteSigner={noop} onExternal={noop} />;
}
// Boris has no login screen to show, and that is the comparison. Its first
// screen is Home, signed out, already full of articles — the two dismissible
// prompts are the only thing on it that mentions an account, and neither
// blocks. Mounting a stand-in auth screen here would hide the one row of this
// table Boris actually wins.
function BorisFirst() {
  return (
    <BorisHome
      loggedIn={false}
      showFirstTime
      showLoginPrompt
      progress={{}}
      onDismissFirstTime={noop}
      onDismissLoginPrompt={noop}
      onOpenAbout={noop}
      onOpenLogin={noop}
      onOpenSupport={noop}
      onOpenProfile={noop}
      onOpenHomeSettings={noop}
      onOpenArticle={noop}
    />
  );
}

export const firstScreenSurface: Surface = {
  id: 'first-screen',
  label: 'The first screen',
  blurb:
    'What each client asks for before it lets you in — and whether there is a way past it without a key. This is the same question the top two rows of the matrix answer in words. Boris is the odd one out on purpose: its first screen is not a door, it is the reading list.',
  byClient: {
    damus: { Component: DamusFirst, rootClass: 'damus-simulator', natural: PHONE },
    amethyst: { Component: AmethystFirst, rootClass: 'amethyst-simulator', natural: PHONE },
    primal: { Component: PrimalFirst, rootClass: 'primal-web', natural: WEB },
    yakihonne: { Component: YakiFirst, rootClass: 'yakihonne-simulator', natural: PHONE },
    snort: { Component: SnortFirst, rootClass: 'snort-simulator', natural: WEB },
    wisp: { Component: WispFirst, rootClass: 'wisp-simulator', natural: PHONE },
    nostur: { Component: NosturFirst, rootClass: 'nostur-simulator', natural: PHONE },
    coracle: { Component: CoracleFirst, rootClass: 'coracle-simulator', natural: WEB },
    boris: { Component: BorisFirst, rootClass: 'boris-simulator', natural: PHONE },
  },
};
