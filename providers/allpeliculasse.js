const CryptoJS = require("crypto-js");

const TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
const BASE_URL = "https://allpeliculas.la";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// funciones:
// cleanTitle()
// getSearchQuery()
// getTMDBInfo()
// searchAllPeliculas()
// resolveStreamwish()
// resolveVidhide()
// resolveFilemoon()
// resolveDoodstream()
// resolveStreamtape()
// resolveWaaw()
// resolveVoe()
// resolveOkRu()
// resolveVimeos()
// resolveGoodstream()
// resolveEmbed()
// getStreams()

module.exports = {
  getStreams
};
