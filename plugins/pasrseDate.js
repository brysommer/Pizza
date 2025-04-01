const parseDateString = (dateString) => {

    const regex = /^\d{2}.\d{2}.\d{4}$/;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)\.(\d{2})\.(\d{2})\.(\d{4})$/;


    if (regex.test(dateString)) {
        const dateParts = dateString.split('.');

        return [dateParts[0], dateParts[1], dateParts[2]];
    } 

    if (timeRegex.test(dateString)) {
        const dateParts = dateString.split('.');

        return [dateParts[0], dateParts[1], dateParts[2], dateParts[3]];
    }

    return null;
}

export default parseDateString;

