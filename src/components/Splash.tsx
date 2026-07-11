import logo from '../assets/logo.png';
import './Splash.css';

export function Splash() {
  return (
    <div className="splash">
      <img src={logo} alt="Звільнимо" className="splash-logo" />
      <div className="splash-spinner" aria-hidden="true" />
      <p className="splash-text">Ми вже працюємо над вашою справою.</p>
      <p className="splash-subtext">Фінансова свобода вже близько.</p>
    </div>
  );
}
