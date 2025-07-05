const AdScripts = () => {
  return (
    <>
      {/* Googler Adsense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3632222360837456"
        crossOrigin="anonymous"
      ></script>
      {/* Google tag (gtag.js) */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-1R35RBBGXL"
      ></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-1R35RBBGXL');
        `}
      </script>

      {/* monetag - Vignette Banner  */}
      {/* <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Embedding external advertisement script
        dangerouslySetInnerHTML={{
          __html: `(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('gizokraijaw.net',9519893,document.createElement('script'))`,
        }}
      /> */}
      {/* monetag - In-Page Push  */}
      {/* <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Embedding external advertisement script
        dangerouslySetInnerHTML={{
          __html: `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('vemtoutcheeg.com',9519899,document.createElement('script'))`,
        }}
      /> */}
    </>
  );
};

export { AdScripts };
