const testTour = new Tour({
    name: "The Park Camper",
    price: 997
});

testTour.save()
    .then((doc) => console.log(doc))
    .catch(err => console.log(err, err.name, err._message, err.message));