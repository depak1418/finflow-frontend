export default function Loader() {
  return (
    <div style={{
      display:'flex', alignItems:'center',
      justifyContent:'center', height:'200px'
    }}>
      <div style={{
        width:'36px', height:'36px',
        border:'3px solid #2a3348',
        borderTop:'3px solid #4f8ef7',
        borderRadius:'50%',
        animation:'spin 0.7s linear infinite'
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}