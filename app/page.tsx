import PhoneHome from "./components/phone-home";
import LaptopMonthly from "./components/laptop-monthly";

export default function Home() {
  return (
    <>
      <div className="md:hidden">
        <PhoneHome />
      </div>
      <div className="hidden md:block">
        <LaptopMonthly />
      </div>
    </>
  );
}
