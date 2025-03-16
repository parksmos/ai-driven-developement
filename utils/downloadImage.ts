/**
 * 이미지 다운로드 관련 유틸리티 함수
 * 두 가지 다운로드 방식을 제공:
 * 1. fetch API를 사용한 기본 다운로드
 * 2. Canvas API를 사용한 CORS 우회 다운로드 (백업 방식)
 */

/**
 * 이미지 다운로드 기본 함수
 * fetch API를 사용하여 이미지를 Blob으로 변환 후 다운로드
 * 
 * @param imageUrl 다운로드할 이미지 URL
 * @param fileName 저장할 파일명 (기본값: 타임스탬프 포함된 이름)
 * @returns Promise<boolean> 다운로드 성공 여부
 */
export const downloadImage = async (imageUrl: string, fileName: string = `artify-${Date.now()}.jpg`): Promise<boolean> => {
  try {
    // 이미지 URL에서 캐시 관련 파라미터 제거
    const cleanImageUrl = imageUrl.split('?')[0];
    
    // Fetch를 사용하여 이미지를 Blob으로 가져오기
    const response = await fetch(cleanImageUrl);
    
    // 응답이 성공적이지 않으면 실패 처리
    if (!response.ok) {
      console.error('이미지 가져오기 실패:', response.status, response.statusText);
      return false;
    }
    
    // 응답을 Blob으로 변환
    const blob = await response.blob();
    
    // Blob에 명시적인 다운로드 타입 설정
    // application/octet-stream은 브라우저에게 다운로드 처리를 지시
    const downloadBlob = new Blob([blob], { type: 'application/octet-stream' });
    
    // Blob을 URL로 변환
    const blobUrl = URL.createObjectURL(downloadBlob);
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none'; // 보이지 않게 처리
    
    // 링크를 문서에 추가하고 클릭
    document.body.appendChild(link);
    link.click();
    
    // 정리: 링크 제거 및 Blob URL 해제
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('다운로드 중 오류 발생:', error);
    return false;
  }
};

/**
 * Canvas API를 사용한 이미지 다운로드 백업 함수
 * CORS 제한이 있는 이미지를 다운로드하기 위한 대체 방법
 * 
 * @param imageUrl 다운로드할 이미지 URL
 * @param fileName 저장할 파일명 (기본값: 타임스탬프 포함된 이름)
 * @returns Promise<boolean> 다운로드 성공 여부
 */
export const downloadImageWithCanvas = (imageUrl: string, fileName: string = `artify-${Date.now()}.jpg`): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // 이미지 URL에서 캐시 관련 파라미터 제거
      const cleanImageUrl = imageUrl.split('?')[0];
      
      // 이미지 요소 생성
      const img = new Image();
      
      // CORS 정책으로 인한 오류를 방지하기 위해 crossOrigin 설정
      img.crossOrigin = 'anonymous';
      
      // 이미지 로드 완료 시 캔버스에 그리고 다운로드
      img.onload = () => {
        try {
          // 캔버스 생성
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error('Canvas context not available');
            resolve(false);
            return;
          }
          
          // 캔버스 크기를 이미지 크기에 맞게 설정
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          // 캔버스에 이미지 그리기
          ctx.drawImage(img, 0, 0);
          
          // 이미지 품질 설정 (0.0 ~ 1.0, 기본값 0.92)
          const quality = 0.9;
          
          // MIME 타입 명시적 지정 - application/octet-stream은 브라우저에게 다운로드 처리를 지시
          const mimeType = 'application/octet-stream';
          
          // 캔버스를 Blob으로 변환 (octet-stream으로 지정하여 다운로드 강제)
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error('Canvas to Blob conversion failed');
              resolve(false);
              return;
            }
            
            // Blob URL 생성
            const url = URL.createObjectURL(blob);
            
            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none'; // 보이지 않게 처리
            document.body.appendChild(link);
            link.click();
            
            // 정리: 링크 제거 및 Blob URL 해제
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              resolve(true);
            }, 100);
          }, mimeType, quality);
        } catch (error) {
          console.error('Canvas 작업 중 오류 발생:', error);
          resolve(false);
        }
      };
      
      // 이미지 로드 오류 시 실패 처리
      img.onerror = () => {
        console.warn('Canvas 방식으로 이미지 로드 실패');
        resolve(false);
      };
      
      // 이미지 로드 시작
      img.src = cleanImageUrl;
      
      // 이미지가 이미 캐시되어 있는 경우 onload가 호출되지 않을 수 있으므로 체크
      if (img.complete) {
        img.onload?.(new Event('AlreadyLoaded') as any);
      }
    } catch (error) {
      console.error('downloadImageWithCanvas 예상치 못한 오류:', error);
      resolve(false);
    }
  });
}; 