const formatNumber = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
}

export default formatNumber;