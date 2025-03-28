package be.vinci.ipl.cae.demo.services;

@Service
public class ManagerService {
    
    private final ProducerRegister ProducerRegister;

    public ProducerRegister(ProducerRegister producerRegister) {
        this.producerRegister = producerRegister;
    }

    public boolean registerProducer(String name, String firstname, String company, String email, String password, String street, String number, String box, String postalCode, String city, String country, String phoneNumber) {
        if (producerRegister.findByEmail(email) != null) {
            return false;
        }
        createProducer(name, firstname, company, email, password, street, number, box, postalCode, city, country, phoneNumber);
        return true;
    }

    public void createProducer(String name, String firstname, String company, String email, String password, String street, String number, String box, String postalCode, String city, String country, String phoneNumber) {
        
        Producer producer = new Producer();
        producer.setName(name);
        producer.setFirstname(firstname);
        producer.setCompany(company);
        producer.setEmail(email);
        producer.setPassword(password);
        producer.setStreet(street);
        producer.setNumber(number);
        producer.setBox(box);
        producer.setPostalCode(postalCode);
        producer.setCity(city);
        producer.setCountry(country);
        producer.setPhoneNumber(phoneNumber);
        producer.setDateInscription(LocalDate.now());

        producerRepository.save(producer);      
    }
}