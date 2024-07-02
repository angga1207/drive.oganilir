const Footer = () => {
    return (
        <div className="sm:fixed sm:z-10 w-full bottom-0 left-0">
            <div className="mt-auto p-6 text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right text-xs">
                © {new Date().getFullYear() == 2022 ? 2022 : '2022 - ' + new Date().getFullYear()}.
                Drive Kabupaten Ogan Ilir. | Kominfo Kabupaten Ogan Ilir.
            </div>
        </div>
    );
};

export default Footer;
