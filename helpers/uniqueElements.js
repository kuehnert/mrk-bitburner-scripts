const onlyUnique = (value, index, self) => self.indexOf(value) === index;

const uniqueElements = array => array.filter(onlyUnique);

export default uniqueElements;
