package be.vinci.ipl.cae.demo.services;

/** Producer Service. */
@Service
public class ProducerService {
    
    private final ProducerRegister producerRegister;

  /**
   * Constructor.
   *
   * @param producerRepository the manager repository
   */
    public ProducerRegister(ProducerRegister producerRegister) {
        this.producerRegister = producerRegister;
    }

  /**
   * Register a new producer.
   *
   * @param name the last name
   * @param firstname the first name
   * @param company the company
   * @param email the email
   * @param password the password
   * @param street the street
   * @param number the number
   * @param box the box
   * @param postalCode the postalCode
   * @param city the city
   * @param country the country
   * @param phoneNumber the phoneNumber
   * @return true if the registration is successful, false otherwise
   */
    public boolean registerProducer(String name, String firstname, String company, String email, String password, String street, String number, String box, String postalCode, String city, String country, String phoneNumber) {
        if (producerRegister.findByEmail(email) != null) {
            return false;
        }
        createProducer(name, firstname, company, email, password, street, number, box, postalCode, city, country, phoneNumber);
        return true;
    }

  /**
   * Create a new Producer.
   *
   * @param name the last name
   * @param firstname the first name
   * @param company the company
   * @param email the email
   * @param password the password
   * @param street the street
   * @param number the number
   * @param box the box
   * @param postalCode the postalCode
   * @param city the city
   * @param country the country
   * @param phoneNumber the phoneNumber
   */
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

  /**
   * Get the producer's ID.
   *
   * @param email the email of the producer
   */
  public Producer getProducerId(String email) {
    return producerRepository.findByEmail(email).getProducer();
  }
}