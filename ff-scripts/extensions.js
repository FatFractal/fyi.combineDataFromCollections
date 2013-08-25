var ff = require('ffef/FatFractal');
var io  = require ('io'); // standard CommonJS module
var fs  = require ('fs'); // standard CommonJS module
var bin = require ('binary'); // standard CommonJS module
var hc  = require ('ringo/httpclient'); // not standardised by CommonJS yet, hence ringo prefix. see http://ringojs.org
var Scalr   = Packages.org.imgscalr.Scalr; // import the Scalr Java package
var ImageIO = Packages.javax.imageio.ImageIO; // import the imageIo Java packages

function Person(obj) {
    this.clazz = "Person";
    this.firstName = null;
    this.lastName = null;
    this.gender = null;
    this.mother = null;
    this.father = null;
    this.siblings = null;
    this.picture = null;
    if(obj) {
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
        this.gender = obj.gender;
        this.mother = obj.mother;
        this.father = obj.father;
        this.siblings = obj.siblings;
        this.picture = obj.picture;
    }
    return this;
}

function Episode(obj) {
    this.clazz = "Episode";
    this.title = null;
    this.description = null;
    this.season = null;
    this.episode = null;
    this.originalAir = null;
    if(obj) {
        this.title = obj.title;
        this.description = obj.description;
        this.season = obj.season;
        this.episode = obj.episode;
        this.originalAir = obj.originalAir;
    }
    return this;
}

function Debut(obj) {
    this.clazz = "Debut";
    this.person = null;
    this.episode = null;
    if(obj) {
        this.person = obj.person;
        this.episode = obj.episode;
    }
    return this;
}

exports.cleanup = function() {
    var count = 0;
    var persons = ff.getArrayFromUri("/Persons");
    for (var i = 0; i < persons.length; i++) {
        ff.deleteObj(persons[i]);
        count ++;
    }
    var episodes = ff.getArrayFromUri("/Episodes");
    for (var i = 0; i < episodes.length; i++) {
        ff.deleteObj(episodes[i]);
        count ++;
    }
    var debuts = ff.getArrayFromUri("/Debuts");
    for (var i = 0; i < debuts.length; i++) {
        ff.deleteObj(debuts[i]);
        count ++;
    }
    var r = ff.response();
    r.result = "<h1> Thanks for visiting</h1><p>We have deleted  " + count + " objects from the tests.</p>";
    r.responseCode="200";
    r.statusMessage = "cleanup has deleted " + count + " objects from your backend.";
    r.mimeType = "text/html";
}

exports.combineData = function() {
    print("combineData received request: " + JSON.stringify(ff.getExtensionRequestData()));
    var firstName = ff.getExtensionRequestData().httpParameters['firstName'];
    var person = ff.getObjFromUri("/Persons/(firstName eq '" + firstName + "')")
    print("combineData retrieved Person: " + JSON.stringify(person));
    var r = ff.response();
    if (person === undefined || person === null) {
        r.result = null;
        r.responseCode = "400";
        r.statusMessage = "Did not receive a Person object";
        r.mimeType = "application/json";
        return;
    }
    var debut = ff.getObjFromUri(person.ffUrl + "/BackReferences.Debuts");
    var episode = ff.getReferredObject("episode", debut)
    print("combineData retrieved a Debut object: " + JSON.stringify(debut));
    print("combineData found person.firstName: " + person.firstName);
    print("combineData found debut.episode.title: " + episode.title);
    r.result = {firstName:person.firstName,debutEpisodeTitle:episode.title};
    r.responseCode="200";
    r.statusMessage = "returned custom object data";
    r.mimeType = "application/json";	
}

function getThumb(imgUrl, format) {
    var resizedBytes = null;
    /**
     * We need a BufferedImage for the Scalr processing
     * There are ImageIO read methods for InputStream, File and URL. We've got a
     * ByteArray. So let's create a ByteArrayInputStream.
     */
    try {
        var picData = hc.get(imgUrl).contentBytes;
        var bais = new java.io.ByteArrayInputStream(picData);
        var img  = ImageIO.read(bais);
        /**
         * Resize the picture
         */
        print("img width is: " + img.width + ", height: " + img.height);
        var resized = Scalr.resize(img, Scalr.Method.SPEED, Scalr.Mode.FIT_EXACT, 167, 300);
        var baos    = new java.io.ByteArrayOutputStream();
        ImageIO.write (resized, format, baos);
        /**
         * Get the bytes from the ByteArrayOutputStream
         */
        resizedBytes = new bin.ByteArray(baos.toByteArray());
    } catch (e) {}
    return resizedBytes;
}

exports.populate = function() {
    // create the Episode objects
    var count = 0;
    var goodnight = ff.getObjFromUri("/Episodes/(title eq 'Good Night')");
    print("Good Night is: " + goodnight);
    if(!goodnight) {
        goodnight = new Episode();
        goodnight.title = "Good Night";
        goodnight.description = 'Homer and Marge say goodnight to their kids but all does not go according to plan. Bart philosophically contemplates the wonders of the mind, Lisa hears Marge say "Don\'t let the bed bugs bite" and fears that bed bugs will eat her, and Maggie is traumatized by the lyrics of "Rock-a-bye Baby". Ultimately, all of the kids decide to sleep in their parents\' bed.';
        goodnight.season = 1;
        goodnight.episode = 1;
        goodnight.originalAir = 545788800000;
        goodnight = ff.createObjAtUri(goodnight, "/Episodes", "system");
        print("created Good Night");
        count ++;
    }
    var moaningLisa = ff.getObjFromUri("/Episodes/(title eq 'Moaning Lisa')");
    print("Moaning Lisa is: " + moaningLisa);
    if(!moaningLisa) {
        moaningLisa = new Episode();
        moaningLisa.title = "Moaning Lisa";
        moaningLisa.description = 'Lisa wakes up one morning feeling blue. At school, she gets in trouble with her music teacher for improvising, and her gym teacher sends home a note to her parents saying she refused to play dodgeball because she was sad. At home, Homer and Bart pummel each other at video boxing, but try as he might, Homer is unable to defeat Bart.';
        moaningLisa.season = 1;
        moaningLisa.episode = 6;
        moaningLisa.originalAir = 659232000000;
        moaningLisa = ff.createObjAtUri(moaningLisa, "/Episodes", "system");
        print("created Moaning Lisa");
        count ++;
    }
    var roasting = ff.getObjFromUri("/Episodes/(title eq 'Simpsons Roasting on an Open Fire')");
    print("Simpsons Roasting on an Open Fire is: " + roasting);
    if(!roasting) {
        roasting = new Episode();
        roasting.title = "Simpsons Roasting on an Open Fire";
        roasting.description = 'After attending the Springfield Elementary School Christmas pageant, the Simpsons prepare for the holiday season. Marge asks Bart and Lisa for their letters to Santa. Lisa requests a pony, and Bart requests a tattoo. The next day, Marge takes the kids to the mall to go Christmas shopping at a department store in the mall. Bart slips away to the tattoo parlor and attempts to get a tattoo that reads "Mother". With the tattoo partially completed, Marge bursts in and drags Bart two doors down to the dermatologist to have it removed. Counting on Homer\'s Christmas bonus, Marge spends all of the family\'s holiday money on the procedure. Meanwhile, at the power plant Homer\'s boss, Mr. Burns, announces that there will be no Christmas bonus this year.';
        roasting.season = 1;
        roasting.episode = 8;
        roasting.originalAir = 629856000000;
        roasting = ff.createObjAtUri(roasting, "/Episodes", "system");
        print("created Simpsons Roasting on an Open Fire");
        count ++;
    }
    var grampa = ff.getObjFromUri("/Episodes/(title eq 'Grampa and the Kids')");
    print("Grampa and the Kids is: " + roasting);
    if(!grampa) {
        grampa = new Episode();
        grampa.title = "Grampa and the Kids";
        grampa.description = 'Grampa tells the kids stories from the good old days. When the kids stop paying attention to him, he feigns his own death to recapture their attention.';
        grampa.season = 2;
        grampa.episode = 19;
        grampa.originalAir = 568771200000;
        grampa = ff.createObjAtUri(grampa, "/Episodes", "system");
        print("created Grampa and the Kids");
        count ++;
    }
    var oBrother = ff.getObjFromUri("/Episodes/(title eq 'Oh Brother\, Where Art Thou')");
    print("Oh Brother, Where Art Thou is: " + oBrother);
    if(!oBrother) {
        oBrother = new Episode();
        oBrother.title = "Oh Brother\, Where Art Thou";
        oBrother.description = 'After watching the latest McBain film, Grampa suffers a mild heart attack. Thinking he might die, he is prompted to confess a long-hidden secret: Homer has a half-brother. Grampa explains that he met a carnival prostitute before marrying Homer\'s mother, and they had a son that they left at the Shelbyville Orphanage. Determined to find his brother, Homer and his family go to the orphanage and find out that Grampa\'s love child was adopted by a Mr. and Mrs. Powell and named Herbert.';
        oBrother.season = 2;
        oBrother.episode = 28;
        oBrother.originalAir = 667094400000;
        oBrother = ff.createObjAtUri(oBrother, "/Episodes", "system");
        print("created Oh Brother, Where Art Thou");
        count ++;
    }
    // create the Person objects
    var img;
    var abraham = ff.getObjFromUri("/Persons/(firstName eq 'Abraham')");
    print("Abraham is: " + abraham);
    if(!abraham) {
        abraham = new Person();
        abraham.firstName = "Abraham";
        abraham.lastName = "Simpson";
        abraham.gender = "Male";
        abraham = ff.createObjAtUri(abraham, "/Persons", "system");
        print("created Abraham");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/3/3e/Abe_Simpson.png", "PNG");
    ff.saveBlob(abraham, 'picture', img, 'image/png');
    var mona = ff.getObjFromUri("/Persons/(firstName eq 'Mona')");
    if(!mona) {
        mona = new Person();
        mona.firstName = "Mona";
        mona.lastName = "Simpson";
        mona.gender = "Female";
        mona = ff.createObjAtUri(mona, "/Persons", "system");
        print("created Mona");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/7/7c/Mona_Simpson_-_first_appearance.jpg", "JPG");
    ff.saveBlob(mona, 'picture', img, 'image/jpeg');
    var clancy = ff.getObjFromUri("/Persons/(firstName eq 'Clancy')");
    if(!clancy) {
        clancy = new Person();
        clancy.firstName = "Clancy";
        clancy.lastName = "Bouvier";
        clancy.gender = "Male";
        clancy = ff.createObjAtUri(clancy, "/Persons", "system");
        print("created Abraham");
        count ++;
    }
    img = getThumb("http://images.wikia.com/simpsons/images/3/3b/Clancy_Bouvier.png", "PNG");
    ff.saveBlob(clancy, 'picture', img, 'image/png');
    var jackie = ff.getObjFromUri("/Persons/(firstName eq 'Jackie')");
    if(!jackie) {
        jackie = new Person();
        jackie.firstName = "Jackie";
        jackie.lastName = "Bouvier";
        jackie.gender = "Female";
        jackie = ff.createObjAtUri(jackie, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://images.wikia.com/simpsons/images/a/a8/Jacqueline_Bouvier.png", "PNG");
    ff.saveBlob(jackie, 'picture', img, 'image/png');
    var herb = ff.getObjFromUri("/Persons/(firstName eq 'Herb')")
    if(!herb) {
        herb = new Person();
        herb.firstName = "Herb";
        herb.lastName = "Powell";
        herb.gender = "Male";
        ff.addReferenceToObj(abraham.ffUrl, "father", herb)
        ff.addReferenceToObj(mona.ffUrl, "mother", herb)
        herb = ff.createObjAtUri(herb, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://images.wikia.com/simpsons/images/0/00/Herbert_powell.png", "PNG");
    ff.saveBlob(herb, 'picture', img, 'image/png');
    var homer = ff.getObjFromUri("/Persons/(firstName eq 'Homer')")
    if(!homer) {
        homer = new Person();
        homer.firstName = "Homer";
        homer.lastName = "Simpson";
        homer.gender = "Male";
        ff.addReferenceToObj(abraham.ffUrl, "father", homer)
        ff.addReferenceToObj(mona.ffUrl, "mother", homer)
        homer = ff.createObjAtUri(homer, "/Persons", "system");
        count ++;
    }
    ff.grabBagAdd(homer.ffUrl, herb.ffUrl, "siblings")
    ff.grabBagAdd(herb.ffUrl, homer.ffUrl, "siblings")
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/0/02/Homer_Simpson_2006.png", "PNG");
    ff.saveBlob(homer, 'picture', img, 'image/png');
    var marge = ff.getObjFromUri("/Persons/(firstName eq 'Marge')");
    if(!marge) {
        marge = new Person();
        marge.firstName = "Marge";
        marge.lastName = "Simpson";
        marge.gender = "Female";
        ff.addReferenceToObj(clancy.ffUrl, "father", marge)
        ff.addReferenceToObj(jackie.ffUrl, "mother", marge)
        marge = ff.createObjAtUri(marge, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/0/0b/Marge_Simpson.png", "PNG");
    ff.saveBlob(marge, 'picture', img, 'image/png');
    var patty = ff.getObjFromUri("/Persons/(firstName eq 'Patty')");
    if(!patty) {
        patty = new Person();
        patty.firstName = "Patty";
        patty.lastName = "Bouvier";
        patty.gender = "Female";
        ff.addReferenceToObj(clancy.ffUrl, "father", patty)
        ff.addReferenceToObj(jackie.ffUrl, "mother", patty)
        patty = ff.createObjAtUri(patty, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/f/f8/Patty_Bouvier.png", "PNG");
    ff.saveBlob(patty, 'picture', img, 'image/png');
    var selma = ff.getObjFromUri("/Persons/(firstName eq 'Selma')");
    if(!selma) {
        selma = new Person();
        selma.firstName = "Selma";
        selma.lastName = "Bouvier";
        selma.gender = "Female";
        ff.addReferenceToObj(clancy.ffUrl, "father", selma)
        ff.addReferenceToObj(jackie.ffUrl, "mother", selma)
        selma = ff.createObjAtUri(selma, "/Persons", "system");
        count ++;
    }
    ff.grabBagAdd(marge.ffUrl, patty.ffUrl, "siblings")
    ff.grabBagAdd(selma.ffUrl, patty.ffUrl, "siblings")
    ff.grabBagAdd(patty.ffUrl, marge.ffUrl, "siblings")
    ff.grabBagAdd(selma.ffUrl, marge.ffUrl, "siblings")
    ff.grabBagAdd(marge.ffUrl, selma.ffUrl, "siblings")
    ff.grabBagAdd(patty.ffUrl, selma.ffUrl, "siblings")
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/b/ba/Selma_Bouvier.png", "PNG");
    ff.saveBlob(selma, 'picture', img, 'image/png');
    var bart = ff.getObjFromUri("/Persons/(firstName eq 'Bart')");
    if(!bart) {
        bart = new Person();
        bart.firstName = "Bart";
        bart.lastName = "Simpson";
        bart.gender = "Male";
        ff.addReferenceToObj(homer.ffUrl, "father", bart)
        ff.addReferenceToObj(marge.ffUrl, "mother", bart)
        bart = ff.createObjAtUri(bart, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/thumb/e/ed/Bart_Simpson.svg/500px-Bart_Simpson.svg.png", "PNG");
    ff.saveBlob(bart, 'picture', img, 'image/png');
    var lisa = ff.getObjFromUri("/Persons/(firstName eq 'Lisa')");
    if(!lisa) {
        lisa = new Person();
        lisa.firstName = "Lisa";
        lisa.lastName = "Simpson";
        lisa.gender = "Female";
        ff.addReferenceToObj(homer.ffUrl, "father", lisa)
        ff.addReferenceToObj(marge.ffUrl, "mother", lisa)
        lisa = ff.createObjAtUri(lisa, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/e/ec/Lisa_Simpson.png", "PNG");
    ff.saveBlob(lisa, 'picture', img, 'image/png');
    var maggie = ff.getObjFromUri("/Persons/(firstName eq 'Maggie')");
    if(!maggie) {
        maggie = new Person();
        maggie.firstName = "Maggie";
        maggie.lastName = "Simpson";
        maggie.gender = "Female";
        ff.addReferenceToObj(homer.ffUrl, "father", maggie)
        ff.addReferenceToObj(marge.ffUrl, "mother", maggie)
        maggie = ff.createObjAtUri(maggie, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/9/9d/Maggie_Simpson.png", "PNG");
    ff.saveBlob(maggie, 'picture', img, 'image/png');
    ff.grabBagAdd(lisa.ffUrl, bart.ffUrl, "siblings")
    ff.grabBagAdd(maggie.ffUrl, bart.ffUrl, "siblings")
    ff.grabBagAdd(bart.ffUrl, lisa.ffUrl, "siblings")
    ff.grabBagAdd(maggie.ffUrl, lisa.ffUrl, "siblings")
    ff.grabBagAdd(bart.ffUrl, maggie.ffUrl, "siblings")
    ff.grabBagAdd(lisa.ffUrl, maggie.ffUrl, "siblings")
    var ling = ff.getObjFromUri("/Persons/(firstName eq 'Ling')");
    if(!ling) {
        ling = new Person();
        ling.firstName = "Ling";
        ling.lastName = "Bouvier";
        ling.gender = "Female";
        ff.addReferenceToObj(selma.ffUrl, "mother", ling)
        ling = ff.createObjAtUri(ling, "/Persons", "system");
        count ++;
    }
    img = getThumb("http://upload.wikimedia.org/wikipedia/en/c/c1/LingBouvier.png", "PNG");
    ff.saveBlob(ling, 'picture', img, 'image/png');
    // create the Debut objects
    var homerDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Homer')");
    if(!homerDebut) {
        homerDebut = new Debut();
        ff.addReferenceToObj(homer.ffUrl, "person", homerDebut)
        ff.addReferenceToObj(goodnight.ffUrl, "episode", homerDebut)
        homerDebut = ff.createObjAtUri(homerDebut, "/Debuts", "system");
        count ++;
    }
    var margeDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Marge')");
    if(!margeDebut) {
        margeDebut = new Debut();
        ff.addReferenceToObj(marge.ffUrl, "person", margeDebut)
        ff.addReferenceToObj(goodnight.ffUrl, "episode", margeDebut)
        margeDebut = ff.createObjAtUri(margeDebut, "/Debuts", "system");
        count ++;
    }
    var bartDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Bart')");
    if(!bartDebut) {
        bartDebut = new Debut();
        ff.addReferenceToObj(bart.ffUrl, "person", bartDebut)
        ff.addReferenceToObj(goodnight.ffUrl, "episode", bartDebut)
        bartDebut = ff.createObjAtUri(bartDebut, "/Debuts", "system");
        count ++;
    }
    var lisaDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Lisa')");
    if(!lisaDebut) {
        lisaDebut = new Debut();
        ff.addReferenceToObj(lisa.ffUrl, "person", lisaDebut)
        ff.addReferenceToObj(goodnight.ffUrl, "episode", lisaDebut)
        lisaDebut = ff.createObjAtUri(lisaDebut, "/Debuts", "system");
        count ++;
    }
    var maggieDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Maggie')");
    if(!maggieDebut) {
        maggieDebut = new Debut();
        ff.addReferenceToObj(maggie.ffUrl, "person", maggieDebut)
        ff.addReferenceToObj(goodnight.ffUrl, "episode", maggieDebut)
        maggieDebut = ff.createObjAtUri(maggieDebut, "/Debuts", "system");
        count ++;
    }
    var jackieDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Jackie')");
    if(!jackieDebut) {
        jackieDebut = new Debut();
        ff.addReferenceToObj(jackie.ffUrl, "person", jackieDebut)
        ff.addReferenceToObj(moaningLisa.ffUrl, "episode", jackieDebut)
        jackieDebut = ff.createObjAtUri(jackieDebut, "/Debuts", "system");
        count ++;
    }
    var pattyDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Patty')");
    if(!pattyDebut) {
        pattyDebut = new Debut();
        ff.addReferenceToObj(patty.ffUrl, "person", pattyDebut)
        ff.addReferenceToObj(roasting.ffUrl, "episode", pattyDebut)
        pattyDebut = ff.createObjAtUri(pattyDebut, "/Debuts", "system");
        count ++;
    }
    var selmaDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Selma')");
    if(!selmaDebut) {
        selmaDebut = new Debut();
        ff.addReferenceToObj(selma.ffUrl, "person", selmaDebut)
        ff.addReferenceToObj(roasting.ffUrl, "episode", selmaDebut)
        selmaDebut = ff.createObjAtUri(selmaDebut, "/Debuts", "system");
        count ++;
    }
    var abrahamDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Abraham')");
    if(!abrahamDebut) {
        abrahamDebut = new Debut();
        ff.addReferenceToObj(abraham.ffUrl, "person", abrahamDebut)
        ff.addReferenceToObj(grampa.ffUrl, "episode", abrahamDebut)
        abrahamDebut = ff.createObjAtUri(abrahamDebut, "/Debuts", "system");
        count ++;
    }
    var monaDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Mona')");
    if(!monaDebut) {
        monaDebut = new Debut();
        ff.addReferenceToObj(mona.ffUrl, "person", monaDebut)
        ff.addReferenceToObj(oBrother.ffUrl, "episode", monaDebut)
        monaDebut = ff.createObjAtUri(monaDebut, "/Debuts", "system");
        count ++;
    }
    var herbDebut = ff.getObjFromUri("/Debuts/person/(firstName eq 'Herb')");
    if(!herbDebut) {
        herbDebut = new Debut();
        ff.addReferenceToObj(herb.ffUrl, "person", herbDebut)
        ff.addReferenceToObj(oBrother.ffUrl, "episode", herbDebut)
        herbDebut = ff.createObjAtUri(herbDebut, "/Debuts", "system");
        count ++;
    }
    var r = ff.response();
    r.result = "<h1> Thanks for visiting</h1><p>We have populated " + count + " data objects for the tests.</p>";
    r.responseCode="200";
    r.statusMessage = "populate has created " + count + " data objects to your backend.";
    r.mimeType = "text/html";
}
