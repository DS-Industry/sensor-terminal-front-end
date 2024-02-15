export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-screen">
      <div className=" min-h-[50vh] h-[50vh] w-full bg-black flex justify-center items-center text-white">
        <iframe
          src="/BB_51cc79f9-ca03-45a2-9fa5-3a28e0479bf3_preview.mp4"
          allow="autoplay"
          id="video"
          className=" hidden"
        ></iframe>
        <video
          className=" w-full h-[50vh] object-cover"
          width="320"
          height="240"
          autoPlay
          loop
        >
          <source
            src="/BB_51cc79f9-ca03-45a2-9fa5-3a28e0479bf3_preview.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className=" bg-black">{children}</div>
    </div>
  );
}
