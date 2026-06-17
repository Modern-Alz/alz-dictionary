// A curated bank of words for the "Word of the Day" feature.
// Rotates deterministically by day-of-year so every user sees the same word
// on a given date, and the home page has something rich to show even before
// any AI request is made (works without an API key).

export const WORD_BANK = [
  { term: 'serendipity', phonetic: '/ˌsɛr.ən.ˈdɪp.ɪ.ti/', partOfSpeech: 'noun', definition: 'The occurrence of finding pleasant or valuable things by chance.', example: 'Meeting my business partner at that conference was pure serendipity.' },
  { term: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', partOfSpeech: 'adjective', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern life.' },
  { term: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', partOfSpeech: 'adjective', definition: 'Able to recover quickly from difficulties; tough.', example: 'The community proved resilient after the flood.' },
  { term: 'meticulous', phonetic: '/məˈtɪk.jə.ləs/', partOfSpeech: 'adjective', definition: 'Showing great attention to detail; very careful and precise.', example: 'She kept meticulous records of every transaction.' },
  { term: 'eloquent', phonetic: '/ˈɛl.ə.kwənt/', partOfSpeech: 'adjective', definition: 'Fluent and persuasive in speaking or writing.', example: 'His eloquent speech moved the entire room.' },
  { term: 'pragmatic', phonetic: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective', definition: 'Dealing with things sensibly and realistically.', example: 'We need a pragmatic solution, not an idealistic one.' },
  { term: 'tenacious', phonetic: '/təˈneɪ.ʃəs/', partOfSpeech: 'adjective', definition: 'Holding firmly to something; persistent.', example: 'Her tenacious attitude helped her finish the marathon.' },
  { term: 'candid', phonetic: '/ˈkæn.dɪd/', partOfSpeech: 'adjective', definition: 'Truthful and straightforward; frank.', example: 'He gave a candid answer about the company\'s struggles.' },
  { term: 'ambiguous', phonetic: '/æmˈbɪɡ.juː.əs/', partOfSpeech: 'adjective', definition: 'Open to more than one interpretation; unclear.', example: 'The contract\'s wording was ambiguous and caused confusion.' },
  { term: 'innovate', phonetic: '/ˈɪn.ə.veɪt/', partOfSpeech: 'verb', definition: 'To introduce new ideas, methods, or products.', example: 'The team is under pressure to innovate quickly.' },
  { term: 'diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective', definition: 'Showing care and conscientiousness in one\'s work.', example: 'A diligent student reviews notes every day.' },
  { term: 'empathy', phonetic: '/ˈɛm.pə.θi/', partOfSpeech: 'noun', definition: 'The ability to understand and share the feelings of another.', example: 'Good leaders show empathy toward their teams.' },
  { term: 'frugal', phonetic: '/ˈfruː.ɡəl/', partOfSpeech: 'adjective', definition: 'Sparing or economical with money or resources.', example: 'A frugal lifestyle helped them save for a house.' },
  { term: 'pristine', phonetic: '/ˈprɪs.tiːn/', partOfSpeech: 'adjective', definition: 'In its original condition; unspoiled or clean.', example: 'The beach was pristine, with no litter in sight.' },
  { term: 'versatile', phonetic: '/ˈvɜː.sə.taɪl/', partOfSpeech: 'adjective', definition: 'Able to adapt to many different functions or activities.', example: 'A smartphone is a versatile tool for work and play.' },
  { term: 'arbitrary', phonetic: '/ˈɑːr.bɪ.trər.i/', partOfSpeech: 'adjective', definition: 'Based on random choice rather than reason or system.', example: 'The fine seemed arbitrary and unrelated to the offense.' },
  { term: 'cohesive', phonetic: '/koʊˈhiː.sɪv/', partOfSpeech: 'adjective', definition: 'Forming a united whole; sticking together well.', example: 'The new manager built a cohesive team in months.' },
  { term: 'discern', phonetic: '/dɪˈsɜːrn/', partOfSpeech: 'verb', definition: 'To perceive or recognize something clearly.', example: 'It was hard to discern his true intentions.' },
  { term: 'elaborate', phonetic: '/ɪˈlæb.ə.rət/', partOfSpeech: 'adjective', definition: 'Detailed and complicated in design or planning.', example: 'They held an elaborate ceremony for the opening.' },
  { term: 'feasible', phonetic: '/ˈfiː.zə.bəl/', partOfSpeech: 'adjective', definition: 'Possible to do easily or conveniently.', example: 'Is it feasible to finish the project by Friday?' },
  { term: 'gratitude', phonetic: '/ˈɡræt.ɪ.tʃuːd/', partOfSpeech: 'noun', definition: 'The quality of being thankful.', example: 'She expressed her gratitude with a heartfelt letter.' },
  { term: 'hypothesis', phonetic: '/haɪˈpɒθ.ə.sɪs/', partOfSpeech: 'noun', definition: 'A proposed explanation made on limited evidence, to be tested.', example: 'The scientist tested her hypothesis with three experiments.' },
  { term: 'imminent', phonetic: '/ˈɪm.ɪ.nənt/', partOfSpeech: 'adjective', definition: 'About to happen very soon.', example: 'Dark clouds suggested an imminent storm.' },
  { term: 'juxtapose', phonetic: '/ˈdʒʌk.stə.poʊz/', partOfSpeech: 'verb', definition: 'To place two things side by side for contrast.', example: 'The exhibit juxtaposes old photographs with modern ones.' },
  { term: 'lucid', phonetic: '/ˈluː.sɪd/', partOfSpeech: 'adjective', definition: 'Expressed clearly; easy to understand.', example: 'He gave a lucid explanation of the tax changes.' },
  { term: 'meager', phonetic: '/ˈmiː.ɡər/', partOfSpeech: 'adjective', definition: 'Lacking in quantity or quality.', example: 'They survived on a meager budget for months.' },
  { term: 'novel', phonetic: '/ˈnɒv.əl/', partOfSpeech: 'adjective', definition: 'New or unusual in an interesting way.', example: 'The startup proposed a novel approach to recycling.' },
  { term: 'optimistic', phonetic: '/ˌɒp.tɪˈmɪs.tɪk/', partOfSpeech: 'adjective', definition: 'Hopeful and confident about the future.', example: 'Despite the setback, she remained optimistic.' },
  { term: 'plausible', phonetic: '/ˈplɔː.zə.bəl/', partOfSpeech: 'adjective', definition: 'Seeming reasonable or probable.', example: 'His excuse sounded plausible at first.' },
  { term: 'quintessential', phonetic: '/ˌkwɪn.tɪˈsɛn.ʃəl/', partOfSpeech: 'adjective', definition: 'Representing the most perfect example of a quality.', example: 'Jollof rice is a quintessential dish at Nigerian parties.' },
  { term: 'reluctant', phonetic: '/rɪˈlʌk.tənt/', partOfSpeech: 'adjective', definition: 'Unwilling and hesitant to do something.', example: 'He was reluctant to speak in front of the class.' },
  { term: 'scrutinize', phonetic: '/ˈskruː.tɪ.naɪz/', partOfSpeech: 'verb', definition: 'To examine something closely and carefully.', example: 'The auditors scrutinized every receipt.' },
  { term: 'tangible', phonetic: '/ˈtæn.dʒə.bəl/', partOfSpeech: 'adjective', definition: 'Able to be touched or perceived as real.', example: 'The project finally produced tangible results.' },
  { term: 'unprecedented', phonetic: '/ʌnˈprɛs.ɪ.dɛn.tɪd/', partOfSpeech: 'adjective', definition: 'Never done or known before.', example: 'The city saw unprecedented growth last year.' },
  { term: 'verify', phonetic: '/ˈvɛr.ɪ.faɪ/', partOfSpeech: 'verb', definition: 'To confirm the truth or accuracy of something.', example: 'Please verify your email address to continue.' },
  { term: 'wary', phonetic: '/ˈwɛər.i/', partOfSpeech: 'adjective', definition: 'Feeling or showing caution about possible dangers.', example: 'Be wary of links from unknown senders.' },
  { term: 'zealous', phonetic: '/ˈzɛl.əs/', partOfSpeech: 'adjective', definition: 'Showing great energy or enthusiasm for a cause.', example: 'The new recruit was zealous about hitting his targets.' },
  { term: 'benevolent', phonetic: '/bəˈnɛv.ə.lənt/', partOfSpeech: 'adjective', definition: 'Kind and generous.', example: 'A benevolent donor funded the entire scholarship program.' },
  { term: 'concise', phonetic: '/kənˈsaɪs/', partOfSpeech: 'adjective', definition: 'Giving information clearly and in few words.', example: 'Keep your email concise so people actually read it.' },
  { term: 'diverse', phonetic: '/daɪˈvɜːrs/', partOfSpeech: 'adjective', definition: 'Showing a great deal of variety.', example: 'Lagos has a wonderfully diverse food scene.' },
  { term: 'integrity', phonetic: '/ɪnˈtɛɡ.rɪ.ti/', partOfSpeech: 'noun', definition: 'The quality of being honest and having strong moral principles.', example: 'She is respected for her integrity at work.' },
];

/** Returns the word of the day, rotating deterministically by date. */
export function getWordOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % WORD_BANK.length;
  return WORD_BANK[index];
}
