async function getStreams(id, type, season, episode) {
  return [
    {
      name: "Nuvio Latino - Prueba",
      title: "Video de prueba · 720p",
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      quality: "720p"
    }
  ];
}

module.exports = {
  getStreams
};
