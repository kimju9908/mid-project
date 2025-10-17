package kh.BackendCapstone.config;


import org.json.JSONObject;

public class JsonExtractor {
	public static void main(String[] args) {
		try {
			// JSON 문자열
			String json = "{ \"response\": \"여기서 response 값만 추출하고 싶습니다.\", \"otherKey\": \"otherValue\" }";
			
			// JSON 객체 생성
			JSONObject jsonObject = new JSONObject(json);
			
			// "response" 값을 추출
			String response = jsonObject.getString("response");
			
			// response 값 출력
			System.out.println("Response: " + response);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}

